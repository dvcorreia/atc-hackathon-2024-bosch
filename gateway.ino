#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <ESPmDNS.h>

const char* ssid = "TP-Link_9E26";                                                               // Wi-Fi Credentials
const char* password = "62859007";                                                   // Wi-Fi Credentials
const char* serverName = "http://h.dmelo.eu:9572/telegraf";   // HTTP Endpoint
const uint8_t  bleManufacturerId[2] = {0xFF, 0xCC};

// Web Server
WiFiServer server(80);

// BLE variables
BLEScan* pBLEScan;
int scanTime = 1; // BLE scan time in seconds

struct BeaconData {
    uint32_t elapsedTime;     // 4 bytes for elapsed time in seconds
    uint16_t frameCounter;    // 2 bytes for frame counter
    char bleAddress[18];
    bool cloud;
};

#define MAX_DEVICES 10 // Maximum number of scanned devices

class FIFOQueue {
public:
    FIFOQueue() : head(0), tail(0), count(0) {
        // Initialize the buffer
        for (int i = 0; i < MAX_DEVICES; i++) {
            buffer[i] = {};
        }
    }

    // Add a new BeaconData to the queue
    void enqueue(const BeaconData& data) {
        buffer[head] = data; // Add new data at the head position

        // Move head forward and wrap around if necessary
        head = (head + 1) % MAX_DEVICES;

        // If the queue is full, move tail forward
        if (count == MAX_DEVICES) {
            tail = (tail + 1) % MAX_DEVICES; // Remove the oldest value
        } else {
            count++; // Increase count until the queue is full
        }
    }

    // Retrieve a BeaconData from a specific index
    bool getValue(int index, BeaconData& outData) {
        if (index < 0 || index >= count) {
            return false; // Index out of bounds
        }
        outData = buffer[(tail + index) % MAX_DEVICES]; // Get data at the calculated index
        return true;
    }

    // Check if a bleAddress has a specific frameCounter
    bool checkDuplicatedFrameCounter(char bleAddress[18], uint16_t frameCounter) {
        if (count == 0) {
            return false; // Queue is empty
        }
        const BeaconData& data = buffer[head];
        if(strcmp(data.bleAddress, bleAddress) == 0 && data.frameCounter == frameCounter) {
              return true;
        }
        /*
        for (int i = 0; i < count; i++) {
            const BeaconData& data = buffer[(tail + i) % MAX_DEVICES];
            if(strcmp(data.bleAddress, bleAddress) == 0 && data.frameCounter == frameCounter) {
              return true;
            }
        }*/
        return false;
    }

    // Add this method in the FIFOQueue class
    void updateCloud(int index, bool cloud) {
        buffer[index].cloud = cloud;
    }

    // Print current values in the queue
    void printQueue() {
        Serial.println("Beacon Data Queue:");
        for (int i = 0; i < count; i++) {
            const BeaconData& data = buffer[(tail + i) % MAX_DEVICES];
            Serial.printf("Elapsed Time: %u, Frame Counter: %u, Address: %s, Cloud: %b\n",
                          data.elapsedTime, data.frameCounter, data.bleAddress, data.cloud);
        }
        Serial.println();
    }

private:
    BeaconData buffer[MAX_DEVICES]; // Buffer to hold BeaconData
    int head;                        // Index for the next write
    int tail;                        // Index for the next read
    int count;                       // Number of elements currently in the queue
};

FIFOQueue beaconQueue;

// Task handles
TaskHandle_t wifiTaskHandle;
TaskHandle_t bleTaskHandle;

// BLE callback class
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        //Serial.print("Found device: ");
        //Serial.println(advertisedDevice.toString().c_str());
        uint8_t* data = (uint8_t*)advertisedDevice.getManufacturerData().data();
        int dataLen = advertisedDevice.getManufacturerData().length();
        char* manufacturerdata = BLEUtils::buildHexData(NULL, data, advertisedDevice.getManufacturerData().length());
        if (dataLen >= 2 && data[0] == bleManufacturerId[0] && data[1] == bleManufacturerId[1]) {
          Serial.printf("Data: %s \n", manufacturerdata);
        } else {
          return;
        }

        uint16_t frameCounter = (data[6]) | (data[7] << 8);
        uint32_t elapsedTime = (data[2]) | (data[3] << 8) | (data[4] << 16) | (data[5] << 24);
        char bleAddress[18];
        strncpy(bleAddress, advertisedDevice.getAddress().toString().c_str(), 18);
        if(!beaconQueue.checkDuplicatedFrameCounter(bleAddress, frameCounter)) {
          BeaconData bData;
          bData.elapsedTime = elapsedTime;
          bData.frameCounter = frameCounter;
          strncpy(bData.bleAddress, bleAddress, 18);
          bData.cloud = false;

          beaconQueue.enqueue(bData); // Add the new data to the queue
          beaconQueue.printQueue(); 

          // Send found beacon to WiFi task for HTTP POST
          xTaskNotify(wifiTaskHandle, (uint32_t)advertisedDevice.getName().c_str(), eSetValueWithOverwrite);
        } else {
          Serial.println("Error: Duplicated frameCounter");
        }
        
    }
};

// Task for WiFi POST request
void httpTask(void* param) {
    for (;;) {
        // Wait for notification from BLE task
        char* payload = nullptr;

        // Wait for a notification with a timeout
        BaseType_t result = xTaskNotifyWait(0x00, 0xFFFFFFFF, (uint32_t*)&payload, pdMS_TO_TICKS(100)); // 100 ms timeout

        // Check if we received a notification
        if (result == pdTRUE) {
            // Send HTTP POST
            if (WiFi.status() == WL_CONNECTED) {
                HTTPClient http;
                http.begin(serverName);
                http.addHeader("Content-Type", "application/json");
                
                String jsonPayload = "";
                //BeaconData retrievedData;

                for (int i = 0; i < MAX_DEVICES; i++) {
                    BeaconData retrievedData;
                    if(beaconQueue.getValue(i, retrievedData)) {
                      if(retrievedData.cloud == false) {
                          // Convert to JSON
                          retrievedData.cloud = true;
                          jsonPayload = beaconDataToJson(retrievedData);
                          Serial.println(jsonPayload); // Print JSON string

                          int httpResponseCode = http.POST(jsonPayload);
                          
                          if (httpResponseCode >= 200 && httpResponseCode < 300) {
                              beaconQueue.updateCloud(i,true);
                              Serial.printf("HTTP Response code: %d\n", httpResponseCode);
                          } else {
                              Serial.printf("Error in sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
                          }
                      }
                    }
                }

                http.end();
            } else {
                Serial.println("WiFi not connected");
            }
        }

        // Handle web server requests regardless of notification
        handleWebServer();  // This will allow handling HTTP requests
    }
}

// Function to convert BeaconData to a JSON string manually
String beaconDataToJson(const BeaconData& beacon) {
    String jsonString = "{";
    jsonString += "\"elapsedTime\":" + String(beacon.elapsedTime) + ",";
    jsonString += "\"frameCounter\":" + String(beacon.frameCounter) + ",";
    jsonString += "\"bleAddress\":\"" + String(beacon.bleAddress) + "\",";
    jsonString += "\"cloud\":" + String(beacon.cloud ? "true" : "false");
    jsonString += "}";

    return jsonString;
}

// Task for BLE scanning
void bleScanTask(void* param) {
    for (;;) {
        Serial.println("Scanning for BLE devices...");
        pBLEScan->start(scanTime, false);
        //delay(2000); // Adjust as needed
    }
}

// Handle HTTP request to print array of scanned BLE devices
void handleWebServer() {
  WiFiClient client = server.available();   // listen for incoming clients

  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println();

            client.print("<title>Manufacturing Cycle Time</title>");
            client.print("<style>body{font-family:Arial,sans-serif;background-color:#F2F2F2;margin:0;padding:20px;}");
            client.print("table{width:100%;border-collapse:collapse;margin-bottom:20px;box-shadow:0 2px 3px rgba(0,0,0,0.1);background-color:white;}");
            client.print("th,td{padding:12px;text-align:left;border-bottom: 1px solid #ddd;text-align:center;}");
            client.print("th{background-color:#4CAF50;color:white;}");
            client.print("tr:hover{background-color:#f1f1f1;}");
            client.print("@mediascreenand(max-width:600px){table,th,td{font-size:14px;}}</style>");
            client.print("<h1>Manufacturing Cycle Time</h1>");
            client.print("<table><thead><tr><th>Elapsed Time (seconds)</th><th>Frame Counter</th><th>BLE Address</th><th>Cloud Status</th></tr></thead><tbody>");
            client.print("");
            for (int i = 0; i < MAX_DEVICES; i++) {
                BeaconData retrievedData;
                if(beaconQueue.getValue(i, retrievedData)) {
                  client.print("<tr><td>" + String(retrievedData.elapsedTime) + "</td><td>" + String(retrievedData.frameCounter) + "</td><td>" + String(retrievedData.bleAddress) + "</td><td>" + String(retrievedData.cloud ? "true" : "false") + "</td></tr>");
                }
            }
            client.print("</tbody></table>");
            // The HTTP response ends with another blank line:
            client.println();
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("Client Disconnected.");
  }
}

void setup() {
    Serial.begin(115200);

    // Initialize WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("WiFi connected");
    IPAddress ip = WiFi.localIP();
    Serial.print("Local IP address: ");
    Serial.println(ip);

    // Start mDNS
    if (MDNS.begin("gateway-ble")) {  // http://gateway-ble.local
        Serial.println("mDNS responder started");
    } else {
        Serial.println("Error starting mDNS");
    }

    // Initialize BLE
    BLEDevice::init("");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true);

    // Initialize the web server
    server.begin();
    Serial.println("HTTP server started");

    // Create WiFi POST task
    xTaskCreatePinnedToCore(httpTask, "WiFi POST Task", 8192, NULL, 1, &wifiTaskHandle, 0);

    // Create BLE scan task
    xTaskCreatePinnedToCore(bleScanTask, "BLE Scan Task", 8192, NULL, 1, &bleTaskHandle, 1);
}

void loop() {
    // No code in the loop since we're using FreeRTOS tasks
}

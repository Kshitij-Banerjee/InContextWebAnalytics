
# DESCRIPTION 
The package enables clickstream analytics over an e-commerce website `https://4fstore.lv/`. 
The data for this clickstream was obtained by DOI and is a public dataset. 

## Features
In-Context web analytics
 - Unlike other tools like Google Analytics, or Pendo, this product utilises a chrome extension to show the web analytics data in the context of the webpage itself
 - This is done in 2 ways
 -   1) The data is shown as sidebar over the current page being viewed
     2) The data is also *overlayed* on top of the page itself. For example, by highlighting the navigation links on the page with statistics showing as an overlay label
 - Additionally, complex algorithms like K-means and Timeseries analytics is shown on the sidebar using d3 and recharts

   
## INSTALLATION - How to install and setup your code


- The data is already processed. Please see the folder `/DataProcessing` for pyspark notebooks we have used to process the raw clickstream into DAG, Cluster and Time-series structures
- The aggregated data is already placed in a BigQuery Table
- To start the API server,
  1. Navigate to the `api-server` folder.
  2. run `pnpm install` to install the necessary dependencies
  3. Place the auth.json in the chrome-extension folder, and run `export GOOGLE_APPLICATION_CREDENTIALS='/path/to/your/client_secret.json'` on the terminal. 
  4. run `npx tsx server.ts` to start the expressjs node api
 
- To start the chrome extension,
  1. Navigate to the `chrome-extension` folder
  2. run `pnpm install` to install the dependencies
  3. run `pnpm dev` to start the chrome extension
  4. Go to chrome browswer, and type `chrome:extensions` in the url bar
  5. Click `Load Unpacked` on the top left
  6. Select the `dist` folder that was generated from step 3.
  7. The chrome extension should now be available in the brower

     
## EXECUTION - How to run the demo
 
- To see the analytics
  1. Open `https://4fstore.lv`
  2. Click on the extension from the chrome bar top right.
  3. Click on "Inject and see analytics"
  4. This will show the right sidebar with the page analytics, and also highlight the data on the links
  5. Clicking on a link, will reload the sidebar automatically with data of the new page.

[Optional, but recommended] DEMO VIDEO - 
Include the URL of a 1-minute *unlisted* YouTube video in this txt file. 
The video would show how to install and execute your system/tool/approach (e.g, from typing the first command to compile, to system launching, and running some examples).
Feel free to speed up the video if needed (e.g., remove less relevant video segments). 
This video is optional (i.e., submitting a video does not increase scores; not submitting one does not decrease scores).
However, we recommend teams to try and create such a video, because making the video helps teams better think through what they may want to write in the README.txt, and generally how they want to "sell" their work.

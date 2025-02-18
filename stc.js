const http = require('http');
const url = require('url');

// Sample data for shipments with lat/long
let shipments = [
    {
        id: 1125444,
        customerName: "John Doe",
        shipmentId: "SHIP12345",
        billingAddress: "123 Main St.",
        shippingAddress: "456 Elm St.",
        location: {
            latitude: 37.7749,
            longitude: -122.4194
        },
        items: [
            { description: "Product A", quantity: 5, unitPrice: "$10" },
            { description: "Product B", quantity: 3, unitPrice: "$20" }
        ]
    }
];

// Function to generate unique ID
function generateId() {
    return Math.floor(Math.random() * 10000) + shipments.length;
}

// Create an HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl=url.parse(req.url,true);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    
     // Handle GET /api/shipments 
     if (parsedUrl.pathname === '/api/shipments' && req.method === 'GET') {

         res.statusCode=200; 
         res.end(JSON.stringify(shipments));
      }  
      
      // Handle POST /api/shipments 
      else if(parsedUrl.pathname === '/api/shipments' && req.method === 'POST'){

          let body='';

          req.on('data', chunk => {

              body+=chunk.toString();
          });

          req.on('end', () => {

              try{
                  const data=JSON.parse(body);

                  if(!data.customerName || !data.shipmentId || !Array.isArray(data.items)){
                      throw new Error("Invalid request format.");
                  }

                  const newShipment={
                      id :generateId(),
                      customerName:data.customerName ,
                      shipmentId:data.shipmentId ,
                      billingAddress:data.billingAddress||"",
                      shippingAddress:data.shippingAddress||"",
                      location :{
                          latitude :data.location?.latitude||0,
                          longitude :data.location?.longitude||0  
                       },
                       items :data.items 
                   };

                   shipments.push(newShipment);

                    console.log("New Shipment Added:",newShipment);
                    
                    res.statusCode=201; 

                    res.end(JSON.stringify(newShipment));
               }catch(error){
                console.error(error);  

                res.statusCode=400; 

                res.end(JSON.stringify({ error:"Failed adding shipment." }));
               }
           });
       }

       // Handle GET /api/shipments/:id 
       else if(parsedUrl.pathname.startsWith('/api/shipments/') && req.method === 'GET'){
           const id = parseInt(parsedUrl.pathname.split('/')[2]); 

           const foundShipment=shipments.find(s=>parseInt(s.id)===parseInt(id));

           if(foundShipment){
               res.statusCode=200;
               res.end(JSON.stringify(foundShipment));
           }else{
             console.log(`No Shipment Found with ID ${id}`);
             res.statusCode=404;
             res.end(JSON.stringify({ error:`No Shipment Found with ID ${id}` }));
           }
       }

       else{
           // Handle unknown routes

           console.log(`Unknown Route Accessed:${parsedUrl.pathname}`);
           
           res.statusCode=404; 

           res.end(JSON.stringify({ error:"Route not found" }));
       }
});

// Start the server

const PORT=3000;

server.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});

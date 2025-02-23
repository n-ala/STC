const http = require('http');
const url = require('url');

let shipments = [
    {
        id: 1156866,
        customerName: "John Doe",
        shipmentId: "SHIP12345",
        billingAddress: "123 Main St., Riyadh",
        shippingAddress: "456 Elm St., Jeddah",
        shippingAddressAr: "456 شارع العلم، جدة",
        location: {
            latitude: 24.774265,
            longitude: 46.738586 
        },
        items: [
            { description: "Speaker", quantity: 1, unitPrice: "520 SAR" },
            { description: "Screen", quantity: 2, unitPrice: "2240 SAR" }
        ],
        status:"In Transit",
        statusAr:"قيد العبور",
         expectedArrival:"2024-02-25"
    },
    {
       id :1156867 ,
       customerName :"Ahmed Al-Khateeb",
       shipmentId :"SHIP67890",
       billingAddress :"789 King Fahd Rd., Dammam",
       shippingAddress :"321 Prince Sultan Rd., Mecca",
       shippingAddressAr:"321 طريق الأمير سلطان، مكة المكرمة",
       location :{
           latitude :21.4858 , 
           longitude :39.1987  
          } ,
          items:[
              {description:"Iphone 16",quantity :1 ,unitPrice:"3699 SAR"}
           ] ,
           status:"Delivered",
           statusAr:"تم التوصيل",
           expectedArrival:null 
     },
     {
         id :1156868 ,
         customerName :"Mohammed Al-Saud",
         shipmentId :"SHIP11111",
         billingAddress :"901 Corniche Rd., Jeddah",
         shippingAddress :"234 Umar Ibn Abdul Aziz Rd., Medina",
         shippingAddressAr:"234 طريق عمر بن عبد العزيز، المدينة المنورة",
         location:{
             latitude :24.4667 , 
             longitude :39.5833  
          } ,
          items:[
              {description:"TV",quantity :1 ,unitPrice:"2900 SAR"}
          ] ,
          status:"Pending Pickup",
          statusAr:"قيد الاستلام",
          expectedArrival:"2024-03-01"
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
           console.log(parsedUrl.pathname)
           const id = parseInt(parsedUrl.pathname.split('/')[3]); 

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

import Hapi from '@hapi/hapi'; 
import mockShift from './Shifts-mock-api/mockShift.js'; // Ensure this is the correct import

const server = new Hapi.Server({
  host: '127.0.0.1',
  port: '8080',
  routes: {
    cors: {
      origin: 'ignore', // This will block all CORS requests
    },
  },
});

// Sample mock data
let shifts = mockShift; // Use your mock data here

async function main() {
  // Route to get all shifts
  server.route({
    method: 'GET',
    path: '/shifts',
    handler: (request, h) => {
      console.log('Received request for shifts');
      return h.response(shifts); // Use h.response for better response control
    }
  });

  // Route to delete a specific shift
  server.route({
    method: 'DELETE',
    path: '/shifts/{id}',
    handler: (request, h) => {
      const { id } = request.params;
      shifts = shifts.filter(shift => shift.id !== id); // Remove shift by ID
      return h.response({ message: 'Shift deleted successfully' }).code(200); // Return success message
    }
  });
 

  
  server.route({
    method: 'POST',
    path: '/shifts/{id}/book',
    handler: (request, h) => {
      console.log('Received request for Booking shifts');
      const { id } = request.params;
      const shift = shifts.find(shift => shift.id === id);
      const currentTime = Date.now();
  
      if (!shift) {
        console.log(`Shift with ID ${id} not found.`);
        return h.response({ message: 'Shift not found' }).code(404);
      }
  
      if (shift.booked) {
        console.log(`Shift with ID ${id} is already booked.`);
        return h.response({ message: 'Shift is already booked' }).code(400);
      }
  
      if (currentTime >= new Date(shift.startTime).getTime()) {
        console.log(`Shift with ID ${id} has already started.`);
        return h.response({ message: 'Shift has already started' }).code(400);
      }
  
      const hasOverlap = shifts.some(s => 
        s.id !== id && s.booked &&
        (new Date(shift.startTime).getTime() < new Date(s.endTime).getTime() &&
         new Date(shift.endTime).getTime() > new Date(s.startTime).getTime())
      );
  
      if (hasOverlap) {
        console.log(`Shift with ID ${id} overlaps with an already booked shift.`);
        return h.response({ message: 'Shift overlaps with an already booked shift' }).code(400);
      }
  
      // Book the shift
      shift.booked = true;
      console.log(`Shift with ID ${id} successfully booked.`);
      return h.response(shift).code(200);
    },
  });
  

  await server.start();
  console.info(`✅  API server is listening at ${server.info.uri.toLowerCase()}`);
}

main().catch(err => {
  console.error('Error starting server:', err);
});

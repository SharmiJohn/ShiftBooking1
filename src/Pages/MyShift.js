import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
import { format, isToday, isTomorrow, isFuture, parseISO, differenceInHours } from 'date-fns';
import ShiftList from "../Components/ShiftList";

function MyShift() {
  const [bookedShifts, setBookedShifts] = useState({
    today: [],
    tomorrow: [],
    future: {},
  });
  const [todayShift, setTodayShift] = useState({ totalShifts: 0, totalHours: 0 });
  const [tomorrowShift, setTomorrowShift] = useState({ totalShifts: 0, totalHours: 0 });

  useEffect(() => {
    // Fetch all shifts
    fetch("http://localhost:8080/shifts")
      .then(res => res.json())
    
      .then(data => filterBookedShifts(data))

      .catch(error => console.log('Error:', error));
  }, []);

  const filterBookedShifts = (shifts) => {
    const todayShifts = [];
    const tomorrowShifts = [];
    const futureShifts = {};

    shifts.forEach(shift => {
      const { startTime, endTime, booked} = shift; // Ensure the booking property is included
      const shiftDate = parseISO(new Date(startTime).toISOString());

      // Check if the shift is booked
      if (booked) {
        if (isToday(shiftDate)) {
          todayShifts.push(shift);
        } else if (isTomorrow(shiftDate)) {
          tomorrowShifts.push(shift);
        } else if (isFuture(shiftDate)) {
          const formattedDate = format(shiftDate, 'MMMM dd');
          if (!futureShifts[formattedDate]) {
            futureShifts[formattedDate] = [];
          }
          futureShifts[formattedDate].push(shift);
        }
      }
    });

    setBookedShifts({
      today: todayShifts,
      tomorrow: tomorrowShifts,
      future: futureShifts,
    });
    setTodayShift(calculateShiftAndHours(todayShifts));
    setTomorrowShift(calculateShiftAndHours(tomorrowShifts));
  };

  const calculateShiftAndHours = (shifts) => {
    const totalShifts = shifts.length;
    const totalHours = shifts.reduce((acc, shift) => {
      const startDate = new Date(shift.startTime);
      const endDate = new Date(shift.endTime);

      return acc + (isNaN(startDate) || isNaN(endDate) ? 0 : differenceInHours(endDate, startDate));
    }, 0);

    return { totalShifts, totalHours };
  };

  const cancelShift = (shiftId) => {
    fetch(`http://localhost:8080/shifts/${shiftId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete shift");
        return res.json();
      })
      .then(() => {
        setBookedShifts(prev => ({
          ...prev,
          today: prev.today.filter(shift => shift.id !== shiftId),
          tomorrow: prev.tomorrow.filter(shift => shift.id !== shiftId),
          future: Object.keys(prev.future).reduce((acc, key) => {
            acc[key] = prev.future[key].filter(shift => shift.id !== shiftId);
            return acc;
          }, {}),
        }));
      })
      .catch(error => console.error('Error deleting shift:', error));
  };

  return (
    <Card style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', marginBottom: '20px', borderRadius: '16px', border: "1px solid #A4B8D3" }}>
      <CardContent style={{ padding: "0px" }}>
        <Box mb={2}>
          <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8', padding: "15px" }}>
            Today <span style={{ color: "#CBD2E1", fontWeight: "200", fontSize: "15px" }}>  {todayShift.totalShifts} {todayShift.totalShifts === 1 ? 'shift' : 'shifts'}, {todayShift.totalHours}h</span>
          </Typography>
          <Divider style={{ width: '100%' }} />
          <ShiftList shifts={bookedShifts.today} cancelShift={cancelShift} />
        </Box>

        <Box mb={2}>
          <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8 ', padding: "15px" }}>
            Tomorrow <span style={{ color: "#CBD2E1", fontWeight: "200", fontSize: "15px" }}>  {tomorrowShift.totalShifts} {tomorrowShift.totalShifts === 1 ? 'shift' : 'shifts'}, {tomorrowShift.totalHours} h</span>
          </Typography>
          <Divider style={{ width: '100%' }} />
          <ShiftList shifts={bookedShifts.tomorrow} cancelShift={cancelShift} />
        </Box>

        {Object.keys(bookedShifts.future).length > 0 ? (
          Object.keys(bookedShifts.future).map(date => {
            const futureShiftsForDate = bookedShifts.future[date];
            const { totalShifts, totalHours } = calculateShiftAndHours(futureShiftsForDate);
            return (
              <Box key={date} mb={2}>
                <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8', padding: "15px" }}>
                  {date}<span style={{ color: "#CBD2E1", fontWeight: "200", fontSize: "15px" }}>  {totalShifts} {totalShifts === 1 ? 'shift' : 'shifts'}, {totalHours}h</span>
                </Typography>
                <Divider style={{ width: '100%' }} />
                <ShiftList shifts={futureShiftsForDate} cancelShift={cancelShift} />
              </Box>
            );
          })
        ) : (
          <Typography variant="body1">No future shifts available.</Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default MyShift;

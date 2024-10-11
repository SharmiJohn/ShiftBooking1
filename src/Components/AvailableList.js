import React, { useState, useEffect } from 'react';
import { Divider, Button, Typography, CircularProgress } from '@mui/material';

function AvailableList({ shifts, onShiftAction, bookedShiftIds }) {
    console.log(bookedShiftIds)
  const [loadingStates, setLoadingStates] = useState({});
  const currentTime = new Date();

  // Log whenever `bookedShiftIds` changes to confirm state updates
  useEffect(() => {
    console.log("Updated bookedShiftIds:", bookedShiftIds);
  }, [bookedShiftIds]);

  const handleClick = async (shiftId, action) => {
    // Set loading for this specific shift
    setLoadingStates(prev => ({ ...prev, [shiftId]: true }));

    const success = await onShiftAction(shiftId, action);

    // Reset loading for this specific shift
    setLoadingStates(prev => ({ ...prev, [shiftId]: false }));

    // Alert if action was not successful
    if (!success) {
      alert("Action failed. Please try again.");
    }
  };

  return (
    <div>
      {shifts.length === 0 ? (
        <Typography variant="body1">No Shifts Available</Typography>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {shifts.map((shift, index) => {
            const shiftStartTime = new Date(shift.startTime);
            const shiftEndTime = new Date(shift.endTime);
            const isShiftStarted = currentTime >= shiftStartTime;
            const isAlreadyBooked = bookedShiftIds.includes(shift.id);

            // Check if there are any overlapping booked shifts
            const hasOverlap = bookedShiftIds.some(bookedId => {
              const bookedShift = shifts.find(s => s.id === bookedId);
              return (
                bookedShift &&
                (shiftStartTime < new Date(bookedShift.endTime) &&
                  shiftEndTime > new Date(bookedShift.startTime))
              );
            });

            // Determine button text and action based on shift state
            let buttonText = "Book";
            let isDisabled = false;
            let buttonAction = "book";

            if (isAlreadyBooked) {
              buttonText = "Cancel";
              buttonAction = "cancel";
            } else if (isShiftStarted) {
              buttonText = "Cancel";
              isDisabled = true;
            } else if (hasOverlap) {
              buttonText = "Overlapping";
              isDisabled = true;
            }

            const loading = loadingStates[shift.id] || false; // Get loading state for this shift

            return (
              <li key={shift.id} style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Typography variant="body1" style={{ paddingLeft: "15px", color: "#4F6C92", fontSize: "20px" }}>
                    {shiftStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {' - '}
                    {shiftEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleClick(shift.id, buttonAction)}
                    style={{
                      marginRight: "30px",
                      color: isDisabled ? "#A4B8D3" : buttonAction === "cancel" ? "#FF0000" : "#16A64D",
                      border: isDisabled ? "2px solid #A4B8D3" : "2px solid " + (buttonAction === "cancel" ? "#FF0000" : "#16A64D"),
                      borderRadius: "30px",
                      padding: "10px 30px",
                      textTransform: "none",
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isDisabled || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : buttonText}
                  </Button>
                </div>
                <Typography style={{ paddingLeft: "15px", color: '#A4B8D3' }}>{shift.area}</Typography>
                {index < shifts.length - 1 && <Divider style={{ margin: '8px 0', width: "100%" }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AvailableList;


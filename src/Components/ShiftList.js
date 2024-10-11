import React from 'react';
import { Divider, Button, Typography } from '@mui/material';

function ShiftList({ shifts, cancelShift }) {
  const currentTime = new Date();

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

            return (
              <li key={shift.id} style={{ }}>
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
                    onClick={() => cancelShift(shift.id)}
                    style={{
                      marginRight: "30px",
                      color: isShiftStarted ? "#EED2DF" : "#E2006A", // Color for disabled state
                      border: isShiftStarted ? "2px solid #EED2DF" : "2px solid #FE93B3", // Border for disabled state
                      borderRadius: "30px",
                      padding: "10px 30px 10px 30px",
                       textTransform: "none"
                    }}
                    disabled={isShiftStarted}  // Disable if the shift has already started
                  >
                    Cancel
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

export default ShiftList;

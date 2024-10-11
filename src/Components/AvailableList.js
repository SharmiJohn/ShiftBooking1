import React, { useState, useEffect } from 'react';
import { Divider, Button, Typography, CircularProgress } from '@mui/material';

function AvailableList({ shifts, onShiftAction, bookedShiftIds }) {
    const [loadingStates, setLoadingStates] = useState({});
    const currentTime = new Date();

    
    useEffect(() => {
        console.log("Updated bookedShiftIds:", bookedShiftIds);
    }, [bookedShiftIds]);

    const handleClick = async (shiftId, action) => {
        
        setLoadingStates(prev => ({ ...prev, [shiftId]: true }));

        const success = await onShiftAction(shiftId, action);
        
        // Reset loading for this specific shift
        setLoadingStates(prev => ({ ...prev, [shiftId]: false }));
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
                                (shiftStartTime < bookedShift.endTime &&
                                    shiftEndTime > bookedShift.startTime)
                            );
                        });

                     
                        let buttonText = "Book";
                        let isDisabled = false;
                        let buttonAction = "book";

                        
                        if (isAlreadyBooked) {
                            buttonText = "Booked"; 
                            isDisabled = true; 
                        } else if (isShiftStarted) {
                            buttonText = "Cancel"; // Show "Started" if the shift has started
                            isDisabled = true; // Disable booking action for started shifts
                        } else if (hasOverlap) {
                            buttonText = "Overlapping"; // Show "Overlapping" if there's an overlap
                            isDisabled = true; 
                        }

                        const loading = loadingStates[shift.id] || false; 

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
                                        onClick={isDisabled ? undefined : () => handleClick(shift.id, buttonAction)}
                                        style={{
                                            marginRight: "30px",
                                            color: isDisabled ? "#A4B8D3" : buttonAction === "cancel" ? "#FF0000" : "#16A64D",
                                            border: isDisabled ? "2px solid #A4B8D3" : "2px solid " + (buttonAction === "cancel" ? "#FF0000" : "#16A64D"),
                                            borderRadius: "30px",
                                            padding: "10px 30px",
                                            textTransform: "none",
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        }}
                                        disabled={isDisabled || loading} // Combined disabled condition
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

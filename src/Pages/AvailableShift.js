import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider, Box, Button, Snackbar } from '@mui/material';
import AvailableList from '../Components/AvailableList';
import MuiAlert from '@mui/material/Alert';
import { format, isToday, isTomorrow, isFuture, parseISO } from 'date-fns';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function AvailableShifts() {
  const [availableShifts, setAvailableShifts] = useState({ today: [], tomorrow: [], future: {} });
  const [selectedCity, setSelectedCity] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [bookedShiftIds, setBookedShiftIds] = useState([]);
  const [cities, setCities] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/shifts")
      .then(res => res.json())
      .then(data => {
        categorizeAvailableShifts(data);
        if (data.length > 0) {
          const firstCity = data[0].area;
          setSelectedCity(firstCity);
        }
      })
      .catch(error => console.log('Error:', error));
  }, []);

  const categorizeAvailableShifts = (shifts) => {
    const availableTodayShifts = [];
    const availableTomorrowShifts = [];
    const availableFutureShifts = {};
    const cityMap = {};

    shifts.forEach(shift => {
      const { startTime } = shift;
      const shiftDate = typeof startTime === 'number' ? new Date(startTime) : parseISO(startTime);

      if (isToday(shiftDate)) {
        availableTodayShifts.push(shift);
      } else if (isTomorrow(shiftDate)) {
        availableTomorrowShifts.push(shift);
      } else if (isFuture(shiftDate)) {
        const formattedDate = format(shiftDate, 'MMMM dd');
        if (!availableFutureShifts[formattedDate]) {
          availableFutureShifts[formattedDate] = [];
        }
        availableFutureShifts[formattedDate].push(shift);
      }

      if (!cityMap[shift.area]) {
        cityMap[shift.area] = [];
      }
      cityMap[shift.area].push(shift);
    });

    setAvailableShifts({
      today: availableTodayShifts,
      tomorrow: availableTomorrowShifts,
      future: availableFutureShifts,
    });
    setCities(cityMap);
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
  };

  const handleShiftAction = async (shiftId, action) => {
    const shift = availableShifts.today.concat(availableShifts.tomorrow, Object.values(availableShifts.future).flat())
      .find(s => s.id === shiftId);

    const url = action === 'cancel' 
      ? `http://localhost:8080/shifts/${shiftId}/cancel` 
      : `http://localhost:8080/shifts/${shiftId}/book`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shift),
      });
      const data = await response.json();
      
      if (data.success) {
        if (action === 'cancel') {
          setBookedShiftIds(prev => prev.filter(id => id !== shiftId));
          setSnackbarMessage('Shift canceled successfully!');
        } else {
          setBookedShiftIds(prev => [...prev, shiftId]);
          setSnackbarMessage('Shift booked successfully!');
        }
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to update the shift.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      setSnackbarMessage('Error updating shift.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getCityShifts = () => {
    if (!selectedCity) return { today: [], tomorrow: [], future: {} };

    const cityShifts = cities[selectedCity] || [];
    const filteredShifts = { today: [], tomorrow: [], future: {} };

    cityShifts.forEach(shift => {
      const { startTime } = shift;
      const shiftDate = typeof startTime === 'number' ? new Date(startTime) : parseISO(startTime);

      if (isToday(shiftDate)) {
        filteredShifts.today.push(shift);
      } else if (isTomorrow(shiftDate)) {
        filteredShifts.tomorrow.push(shift);
      } else if (isFuture(shiftDate)) {
        const formattedDate = format(shiftDate, 'MMMM dd');
        if (!filteredShifts.future[formattedDate]) {
          filteredShifts.future[formattedDate] = [];
        }
        filteredShifts.future[formattedDate].push(shift);
      }
    });

    return filteredShifts;
  };

  const filteredShifts = getCityShifts();

  return (
    <Card style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', marginBottom: '20px', borderRadius: '16px', border: '1px solid #A4B8D3' }}>
      <CardContent style={{ padding: "0px" }}>
        <Box display="flex" justifyContent="space-around" mb={2}>
          {Object.keys(cities).map(city => (
            <Button
              key={city}
              onClick={() => handleCityClick(city)}
              style={{
                margin: '5px',
                background: selectedCity === city ? '#004FB4' : '#F1F4F8',
                color: selectedCity === city ? '#fff' : '#4F6C92',
                border: `2px solid ${selectedCity === city ? '#004FB4' : '#A4B8D3'}`,
              }}
            >
              {city} ({cities[city].length})
            </Button>
          ))}
        </Box>

        {selectedCity && (
          <Box>
            <Typography variant="h5" style={{ padding: "15px", textAlign: 'center', color: '#4F6C92' }}>
              Available Shifts in {selectedCity}
            </Typography>

            {filteredShifts.today.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8', padding: "15px" }}>
                  Today
                </Typography>
                <Divider style={{ width: '100%' }} />
                <AvailableList 
                  shifts={filteredShifts.today}
                  onShiftAction={handleShiftAction} 
                  bookedShiftIds={bookedShiftIds} 
                />
              </Box>
            )}

            {filteredShifts.tomorrow.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8', padding: "15px" }}>
                  Tomorrow
                </Typography>
                <Divider style={{ width: '100%' }} />
                <AvailableList 
                  shifts={filteredShifts.tomorrow}
                  onShiftAction={handleShiftAction} 
                  bookedShiftIds={bookedShiftIds} 
                />
              </Box>
            )}

            {Object.keys(filteredShifts.future).length > 0 && (
              <Box mb={2}>
                {Object.keys(filteredShifts.future).map(date => (
                  <Box key={date}>
                    <Typography variant="h6" style={{ color: '#4F6C92', fontWeight: 600, background: '#F1F4F8', padding: "15px" }}>
                      {date}
                    </Typography>
                    <Divider style={{ width: '100%' }} />
                    <AvailableList 
                      shifts={filteredShifts.future[date]}
                      onShiftAction={handleShiftAction} 
                      bookedShiftIds={bookedShiftIds} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default AvailableShifts;

import React from 'react';
import {useState, useEffect} from 'react';
function OverView() {
  const [time,settime] = useState('all time ');
  return (
    <div >
      <div>
        <h1>Dash board</h1>
        <p>{time}</p>
      </div>
      <div>
        
      </div>

    </div>
  );
}
export default OverView;
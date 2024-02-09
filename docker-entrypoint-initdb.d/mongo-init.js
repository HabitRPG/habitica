// Wait for STARTUP and STARTUP2 state to end
while (rs.status().myState === 0 || rs.status().myState === 5) sleep(1000);

// Run rs.initiate() if not already PRIMARY.
rs.status().myState === 1 || rs.initiate();

/**
 * My attempt at a real-world elevator scheduling algorithm.
 * The aim is for a simple and elegant solution.
 * 
 * Passed: 1,2,3,4,5,6,8,9,16
 *
 * Level 18 Benchmarks:
 * Transported: 1087
 * Elapsed time: 748s
 * Transported/s: 1.45
 * Avg waiting time: 16.4s
 * Max waiting time: 70.8s
 * Moves: 6001
 */
{
  init: function (elevators, floors) {
    
    setInterval(function () {
      console.log(elevators[0].destinationQueue);
    }, 2000);
    
    var setElevatorIndicator = function (direction) {
      console.log('setIndicator(' + direction + ')');
      this.goingUpIndicator(direction === 'up');
      this.goingDownIndicator(direction === 'down');
    };
    
    // Elevators
    // ---------
    
    elevators.forEach(function (elevator) {
      
      var setIndicator = setElevatorIndicator.bind(elevator);
      
      setIndicator('up');
      
      elevator.on('idle', function () {
        elevator.goToFloor(0);
      });
      
      elevator.on('floor_button_pressed', function (floorNum) {
        elevator.goToFloor(floorNum);
      });
      
      elevator.on('passing_floor', function (floorNum, direction) {
        // Stop at the passing floor if passengers are waiting there to head in the same direction.
        if (direction === 'up' && floors[floorNum].buttonStates.up === 'activated') {
          elevator.goToFloor(floorNum, true);
        } else if (direction === 'down' && floors[floorNum].buttonStates.down === 'activated') {
          elevator.goToFloor(floorNum, true);
        }
      });
      
      elevator.on('stopped_at_floor', function (floorNum) {
        // if there are queued stops above me, and i'm heading up, keep heading up to the closest stop above.
        // if there are no queued stops above me, start heading down, to the closests stop below.
        
        var headingUp = elevator.goingUpIndicator();
        var stopsAbove = elevator.destinationQueue
          .filter(function (destFloorNum) {
            return destFloorNum > floorNum;
          })
          .sort(function (a, b) {
            // ascending
            return a - b;
          });
        var stopsBelow = elevator.destinationQueue
          .filter(function (destFloorNum) {
            return destFloorNum < floorNum;
          })
          .sort(function (a, b) {
            // descending
            return b - a;
          });
        
        if (headingUp && stopsAbove.length) {
          // heading up, stops above
          elevator.destinationQueue = stopsAbove.concat(stopsBelow);
        } else if (headingUp && !stopsAbove.length) {
          // heading up, no stops above
          setIndicator('down');
          elevator.destinationQueue = stopsBelow;
        } else if (stopsBelow.length) {
          // heading down, stops below
          elevator.destinationQueue = stopsBelow.concat(stopsAbove);
        } else if (!stopsBelow.length) {
          // heading down, no stops below
          setIndicator('up');
          elevator.destinationQueue = stopsAbove;
        }
        
        elevator.checkDestinationQueue();

      });
      
    });
    
    // Floors
    // ------
    
    floors.forEach(function (floor) {
      
      floor.on('up_button_pressed down_button_pressed', function () {
        elevators[0].goToFloor(floor.level);
      });
      
    });
    
  },
    
  update: function (dt, elevators, floors) {
    // ...
  }
}
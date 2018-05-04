angular.module('generateServices', [])

.factory('Reports', function($http) {
    var generateFactory = {}; // Create the userFactory object

    // Register users in database
    generateFactory.generateFraud = function(){
        return $http.get('/api/fraud/');
    }
    generateFactory.generateFactual = function(){
        return $http.get('/api/factual/');
    }
    generateFactory.generateType = function(){
    	return $http.get('/api/accidentType/');
    }
    //accident_types----------------------
    generateFactory.HeadOn = function(){
    	return $http.get('/api/HeadOn/');
    }
    generateFactory.animals = function(){
    	return $http.get('/api/animals/');
    }
    generateFactory.Pedestrians = function(){
    	return $http.get('/api/Pedestrians/');
    }

    generateFactory.RearEnd = function(){
    	return $http.get('/api/RearEnd/');
    }
	generateFactory.RollOver = function(){
	    	return $http.get('/api/RollOver/');
	    }

	generateFactory.SideRoadside = function(){
	    	return $http.get('/api/SideRoadside/');
	    }

	generateFactory.Stationary = function(){
	    	return $http.get('/api/Stationary/');
	    }
	// accident cause---------------------------------------
	generateFactory.AnimalCrossings = function(){
	    	return $http.get('/api/AnimalCrossings/');
	    }

	generateFactory.DeadlyCurves = function(){
	    	return $http.get('/api/DeadlyCurves/');
	    }

	generateFactory.DefectiveBreaks = function(){
	    	return $http.get('/api/DefectiveBreaks/');
	    }

	generateFactory.DesignDefects = function(){
	    	return $http.get('/api/DesignDefects/');
	    }

	generateFactory.DistractedDriving = function(){
	    	return $http.get('/api/DistractedDriving/');
	    }

	generateFactory.DrunkDriving = function(){
	    	return $http.get('/api/DrunkDriving/');
	    }

	generateFactory.DrugInfluence = function(){
	    	return $http.get('/api/DrugInfluence/');
	    }

	generateFactory.ImproperTurns = function(){
	    	return $http.get('/api/ImproperTurns/');
	    }

	generateFactory.Rain = function(){
	    	return $http.get('/api/Rain/');
	    }

	generateFactory.RecklessDriving = function(){
	    	return $http.get('/api/RecklessDriving/');
	    }

	generateFactory.RoadRage = function(){
	    	return $http.get('/api/RoadRage/');
	    }
	generateFactory.RunningRedLights = function(){
	    	return $http.get('/api/RunningRedLights/');
	    }
	generateFactory.RunningStopSigns = function(){
	    	return $http.get('/api/RunningStopSigns/');
	    }
	generateFactory.Speeding = function(){
	    	return $http.get('/api/Speeding/');
	    }  
	generateFactory.StreetRacing = function(){
	    	return $http.get('/api/StreetRacing/');
	    } 
    generateFactory.Tailgating = function(){
    	return $http.get('/api/Tailgating/');
    } 
    generateFactory.TireBlowouts = function(){
    	return $http.get('/api/TireBlowouts/');
    } 
    generateFactory.UnsafeLaneChanges = function(){
    	return $http.get('/api/UnsafeLaneChanges/');
    } 

   //violations--------------------------------------
   generateFactory.Negligence = function(){
    	return $http.get('/api/Negligence/');
    } 
     generateFactory.Recklessness = function(){
    	return $http.get('/api/Recklessness/');
    } 
     generateFactory.Intentional = function(){
    	return $http.get('/api/Intentional/');
    } 
     generateFactory.Liability = function(){
    	return $http.get('/api/Liability/');
    } 

    // vehicle type--------------------------------------
    generateFactory.Bus = function(){
    	return $http.get('/api/Bus/');
    } 
    generateFactory.Bicycle = function(){
    	return $http.get('/api/Bicycle/');
    }
    generateFactory.Car = function(){
    	return $http.get('/api/Car/');
    }
    generateFactory.Jeep = function(){
    	return $http.get('/api/Jeep/');
    }
    generateFactory.Motorcycle = function(){
    	return $http.get('/api/Motorcycle/');
    }
    generateFactory.Tricycle = function(){
    	return $http.get('/api/Tricycle/');
    }
    generateFactory.Truck = function(){
    	return $http.get('/api/Truck/');
    }
    generateFactory.Van = function(){
    	return $http.get('/api/Van/');
    }



    return generateFactory;
})
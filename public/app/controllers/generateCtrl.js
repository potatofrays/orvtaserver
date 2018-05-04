angular.module('generateController', ['generateServices'])

// Controller: User to control the management page and managing of user accounts
.controller('generateCtrl', function(Reports, $scope) {
    var app = this;
    $scope.list = {}

    function generateFraud() {
            Reports.generateFraud().then(function(data) {
                  if (data.data.success) {
                        app.fraud = data.data.fraud; 
                   
                  }
            });
      };
      generateFraud();

      function generateFactual(){
            Reports.generateFactual().then(function(data){
                  if (data.data.success) {
                        app.factual = data.data.factual;
                  }
            })
      };
      generateFactual();

      function generateType(){
            Reports.generateType().then(function(data){
                  if (data.data.success) {
                        $scope.list = data.data.type;
                  }
            })
      };
      generateType();

      //accident_type------------------------------------
      function generateHeadOn(){
            Reports.HeadOn().then(function(data){
                  if (data.data.success) {
                        app.HeadOn = data.data.HeadOn;
                  }
            })
      };

      generateHeadOn();

      function generateanimals(){
            Reports.animals().then(function(data){
                  if (data.data.success) {
                        app.animals = data.data.animals;
                  }
            })
      };
      generateanimals();

      function generatePedestrians(){
            Reports.Pedestrians().then(function(data){
                  if (data.data.success) {
                        app.Pedestrians = data.data.Pedestrians;
                  }
            })
      };
      generatePedestrians();

      function generateRearEnd(){
            Reports.RearEnd().then(function(data){
                  if (data.data.success) {
                        app.RearEnd = data.data.RearEnd;
                  }
            })
      };
      generateRearEnd();

      function generateRollOver(){
            Reports.RollOver().then(function(data){
                  if (data.data.success) {
                        app.RollOver = data.data.RollOver;
                  }
            })
      };
      generateRollOver();

      function generateSideRoadside(){
            Reports.SideRoadside().then(function(data){
                  if (data.data.success) {
                        app.SideRoadside = data.data.SideRoadside;
                  }
            })
      };
      generateSideRoadside();

      function generateStationary(){
            Reports.Stationary().then(function(data){
                  if (data.data.success) {
                        app.Stationary = data.data.Stationary;
                  }
            })
      };
      generateStationary();
      //accident_cause------------------------------------
      function generateAnimalCrossings(){
            Reports.AnimalCrossings().then(function(data){
                  if (data.data.success) {
                        app.AnimalCrossings = data.data.AnimalCrossings;
                  }
            })
      };
      generateAnimalCrossings();

      function generateDeadlyCurves(){
            Reports.DeadlyCurves().then(function(data){
                  if (data.data.success) {
                        app.DeadlyCurves = data.data.DeadlyCurves;
                  }
            })
      };
      generateDeadlyCurves();

      function generateDefectiveBreaks(){
            Reports.DefectiveBreaks().then(function(data){
                  if (data.data.success) {
                        app.DefectiveBreaks = data.data.DefectiveBreaks;
                  }
            })
      };
      generateDefectiveBreaks();

      function generateDesignDefects(){
            Reports.DesignDefects().then(function(data){
                  if (data.data.success) {
                        app.DesignDefects = data.data.DesignDefects;
                  }
            })
      };
      generateDesignDefects();

      function generateDistractedDriving(){
            Reports.DistractedDriving().then(function(data){
                  if (data.data.success) {
                        app.DistractedDriving = data.data.DistractedDriving;
                  }
            })
      };
      generateDistractedDriving();

      function generateDrunkDriving(){
            Reports.DrunkDriving().then(function(data){
                  if (data.data.success) {
                        app.DrunkDriving = data.data.DrunkDriving;
                  }
            })
      };
      generateDrunkDriving();

       function generateDrugInfluence(){
            Reports.DrugInfluence().then(function(data){
                  if (data.data.success) {
                        app.DrugInfluence = data.data.DrugInfluence;
                  }
            })
      };
      generateDrugInfluence();

      function generateImproperTurns(){
            Reports.ImproperTurns().then(function(data){
                  if (data.data.success) {
                        app.ImproperTurns = data.data.ImproperTurns;
                  }
            })
      };
      generateImproperTurns();

      function generateRain(){
            Reports.Rain().then(function(data){
                  if (data.data.success) {
                        app.Rain = data.data.Rain;
                  }
            })
      };
      generateRain();

      function generateRecklessDriving(){
            Reports.RecklessDriving().then(function(data){
                  if (data.data.success) {
                        app.RecklessDriving = data.data.RecklessDriving;
                  }
            })
      };
      generateRecklessDriving();

      function generateRoadRage(){
            Reports.RoadRage().then(function(data){
                  if (data.data.success) {
                        app.RoadRage = data.data.RoadRage;
                  }
            })
      };
      generateRoadRage();

      function generateRunningRedLights(){
            Reports.RunningRedLights().then(function(data){
                  if (data.data.success) {
                        app.RunningRedLights = data.data.RunningRedLights;
                  }
            })
      };
      generateRunningRedLights();

      function generateRunningStopSigns(){
            Reports.RunningStopSigns().then(function(data){
                  if (data.data.success) {
                        app.RunningStopSigns = data.data.RunningStopSigns;
                  }
            })
      };
      generateRunningStopSigns();

      function enerateSpeeding(){
            Reports.Speeding().then(function(data){
                  if (data.data.success) {
                        app.Speeding = data.data.Speeding;
                  }
            })
      };
      enerateSpeeding();

      function generateStreetRacing(){
            Reports.StreetRacing().then(function(data){
                  if (data.data.success) {
                        app.StreetRacing = data.data.StreetRacing;
                  }
            })
      };
      generateStreetRacing();

      function generateTailgating(){
            Reports.Tailgating().then(function(data){
                  if (data.data.success) {
                        app.Tailgating = data.data.Tailgating;
                  }
            })
      };
      generateTailgating();

      function generategenerateTireBlowouts(){
            Reports.TireBlowouts().then(function(data){
                  if (data.data.success) {
                        app.TireBlowouts = data.data.TireBlowouts;
                  }
            })
      };
      generategenerateTireBlowouts();

      function generateUnsafeLaneChanges(){
            Reports.UnsafeLaneChanges().then(function(data){
                  if (data.data.success) {
                        app.UnsafeLaneChanges = data.data.UnsafeLaneChanges;
                  }
            })
      };
      generateUnsafeLaneChanges();

      //violations------------------------------------
      function generateNegligence(){
            Reports.Negligence().then(function(data){
                  if (data.data.success) {
                        app.Negligence = data.data.Negligence;
                  }
            })
      };
      generateNegligence();

      function generateRecklessness(){
            Reports.Recklessness().then(function(data){
                  if (data.data.success) {
                        app.Recklessness = data.data.Recklessness;
                  }
            })
      };
      generateRecklessness();

      function generateIntentional(){
            Reports.Intentional().then(function(data){
                  if (data.data.success) {
                        app.Intentional = data.data.Intentional;
                  }
            })
      };
      generateIntentional();

      function generateLiability(){
            Reports.Liability().then(function(data){
                  if (data.data.success) {
                        app.Liability = data.data.Liability;
                  }
            })
      };
      generateLiability();


      //vehicle types------------------------------------
      function generateBus(){
            Reports.Bus().then(function(data){
                  if (data.data.success) {
                        app.Bus = data.data.Bus;
                  }
            })
      };
      generateBus();

      function generateBicycle(){
            Reports.Bicycle().then(function(data){
                  if (data.data.success) {
                        app.Bicycle = data.data.Bicycle;
                  }
            })
      };
      generateBicycle();

      function generateCar(){
            Reports.Car().then(function(data){
                  if (data.data.success) {
                        app.Car = data.data.Car;
                  }
            })
      };
      generateCar();

      function generateJeep(){
            Reports.Jeep().then(function(data){
                  if (data.data.success) {
                        app.Jeep = data.data.Jeep;
                  }
            })
      };
      generateJeep();

      function generateMotorcycle(){
            Reports.Motorcycle().then(function(data){
                  if (data.data.success) {
                        app.Motorcycle = data.data.Motorcycle;
                  }
            })
      };
      generateMotorcycle();

      function generateTricycle(){
            Reports.Tricycle().then(function(data){
                  if (data.data.success) {
                        app.Tricycle = data.data.Tricycle;
                  }
            })
      };
      generateTricycle();

      function generateTruck(){
            Reports.Truck().then(function(data){
                  if (data.data.success) {
                        app.Truck = data.data.Truck;
                  }
            })
      };
      generateTruck();

      function generateVan(){
            Reports.Van().then(function(data){
                  if (data.data.success) {
                        app.Van = data.data.Van;
                  }
            })
      };
      generateVan();








     
})

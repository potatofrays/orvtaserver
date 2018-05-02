angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'resetController', 'managementController','reportServices','reportManagementController', 'addCtrl','headerCtrl', 'geolocation', 'gservice', 'resetRequestController','angularjs-datetime-picker'])

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');

  });

const BASE_URL ="https://metro-node-texting.herokuapp.com/"

angular.module("main", []).controller("mainController", ['$scope', "$http", ($scope, $http) => {
  $http({
    method:"GET", 
    url:BASE_URL + "ping"
  }).then(resp => {
    console.log({resp});
  })


  $http({
    method:"POST",
    url:BASE_URL + "send/message",
    data:JSON.stringify({
      number:"8144219298"
    })
  }).then(resp => {
    console.log({resp});
    console.log(resp.data)
  })
}])
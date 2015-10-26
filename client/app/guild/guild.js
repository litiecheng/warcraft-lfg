(function() {
    'use strict';

    angular
        .module('app.guild')
        .controller('GuildCreateController', GuildCreate)
        .controller('GuildReadController', GuildRead)
        .controller('GuildUpdateController', GuildUpdate)
        .controller('GuildDeleteController', GuildDelete)
        .controller('GuildListController', GuildList)
    ;

    GuildCreate.$inject = ['$scope','socket','$state'];
    function GuildCreate($scope, socket, $state) {
        //Reset error message
        $scope.$parent.error=null;

        //Initialize $scope variables
        $scope.userGuilds = null;

        socket.forward('get:userGuilds',$scope);
        $scope.$on('socket:get:userGuilds',function(ev,guilds){
            $scope.$parent.loading = false;
            $scope.userGuilds = guilds;
        });

        socket.forward('put:guildAd',$scope);
        $scope.$on('socket:put:guildAd',function(ev,guild){
            $scope.$parent.loading = false;
            $state.go("guild-update",{region:guild.region,realm:guild.realm,name:guild.name});
        });

        $scope.updateRegion = function(){
            $scope.$parent.loading = true;
            socket.emit('get:userGuilds',$scope.region);
        };

        $scope.createGuildAd = function(region,realm,name){
            $scope.$parent.loading = true;
            socket.emit('put:guildAd',{region:region,realm:realm,name:name,ad:{}});
        }

    }

    GuildRead.$inject = ["$scope","socket","$state","$stateParams"];
    function GuildRead($scope,socket,$state,$stateParams) {
        //Reset error message
        $scope.$parent.error=null;

        //Initialize $scope variables
        $scope.guild_ad = null;
        $scope.$parent.loading = true;

        socket.emit('get:guild',{"region":$stateParams.region,"realm":$stateParams.realm,"name":$stateParams.name});

        socket.forward('get:guild',$scope);
        $scope.$on('socket:get:guild',function(ev,guild){
            $scope.$parent.loading = false;

            //If not exit, redirect user to dashboard
            if(guild==null)
                $state.go("dashboard");

            $scope.guild = guild;
        });

    }

    GuildUpdate.$inject = ["$scope","socket","$state","$stateParams","LANGUAGES"];
    function GuildUpdate($scope,socket,$state,$stateParams,LANGUAGES) {
        //Reset error message
        $scope.$parent.error=null;

        //Initialize $scope variables
        $scope.languages= LANGUAGES;
        $scope.$parent.loading = true;


        socket.emit('get:guild',{"region":$stateParams.region,"realm":$stateParams.realm,"name":$stateParams.name});

        socket.forward('get:guild',$scope);
        $scope.$on('socket:get:guild',function(ev,guild){
        console.log(guild);
            $scope.$parent.loading = false;
            //If not exit, redirect user to dashboard
            if(guild==null)
                $state.go("dashboard");
            $scope.guild = guild;
        });

        $scope.save = function(){
            socket.emit('put:guildAd',$scope.guild);
            $scope.$parent.loading = true;
        };

        socket.forward('put:guildAd',$scope);
        $scope.$on('socket:put:guildAd',function(){
            $scope.$parent.loading = false;
            $state.go("account");
        });
    }

    GuildDelete.$inject = ['$scope','socket','$state','$stateParams'];
    function GuildDelete($scope, socket, $state, $stateParams) {
        //Reset error message
        $scope.$parent.error=null;

        //Initialize var
        $scope.guild = {name:$stateParams.name, realm:$stateParams.realm, region:$stateParams.region};

        $scope.delete = function(){
            $scope.$parent.loading = true;
            socket.emit('delete:guildAd',$scope.guild);
        };

        socket.forward('delete:guildAd',$scope);
        $scope.$on('socket:delete:guildAd',function(ev,guild){
            $scope.$parent.loading = false;
            $state.go("account");
        });
    }

    GuildList.$inject = ['$scope','socket'];
    function GuildList($scope, socket) {
        
    }
})();
(function () {
    'use strict';

    angular
        .module('app.progress')
        .controller('ProgressController', Progress);

    Progress.$inject = ["$rootScope", "$scope", "$state", "$stateParams", "$location", "$translate", "$timeout", "wlfgAppTitle", "ranking", "realms", "stats", "__env"];
    function Progress($rootScope, $scope, $state, $stateParams, $location, $translate, $timeout, wlfgAppTitle, ranking, realms, stats, __env) {
        wlfgAppTitle.setTitle("WarcraftProgress");

        $scope.$parent.error = null;
        $scope.$parent.loading = true;
        $scope.rankingRegions = __env.rankingRegions;
        $scope.rankingSubregions = __env.rankingSubregions;
        $scope.filters = {tier: __env.tiers.current[0] };
        $scope.filters.states = {};
        $scope.filters.realm = null;
        $scope.realms = [];
        $scope.rankings = [];
        $scope.stats = [];
        $scope.noResults = [];

        $scope.raidName =  __env.tiers[__env.tiers.current[0]].name;

        var initialLoading = false;
        var initialLoadingPage = false;

        $scope.raids = [];
        angular.forEach(__env.tiers.current, function(value, key) {
            $scope.raids.push(__env.tiers[value]);
        });

        $scope.localRealms = {
            selectAll: $translate.instant("SELECT_ALL"),
            selectNone: $translate.instant("SELECT_NONE"),
            reset: $translate.instant("RESET"),
            search: $translate.instant("SEARCH"),
            nothingSelected: $translate.instant("ALL_REALMS")
        };

        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.localRealms = {
                selectAll: $translate.instant("SELECT_ALL"),
                selectNone: $translate.instant("SELECT_NONE"),
                reset: $translate.instant("RESET"),
                search: $translate.instant("SEARCH"),
                nothingSelected: $translate.instant("ALL_REALMS")
            };
        });

        //Reset error message
        $scope.$parent.error = null;
        $scope.path = "pve/";
        if ($stateParams.region) {
            $scope.path += $stateParams.region + "/";
            $scope.filters.region = $stateParams.region;
        }
        if ($stateParams.realm) {
            $scope.path += $stateParams.realm + "/";
            $scope.filters.realm = $stateParams.realm;
        }

        $scope.page = (parseInt($stateParams.page) > 0) ? parseInt($stateParams.page) : 1;
        $scope.lastPage = $scope.page;

        $scope.$watch('filters.region', function () {
            $timeout(function () {
                $scope.$emit('get:realms');
            });
        });

        $scope.$watch('filters', function () {
            if (initialLoading) {
                if ($scope.page > 1) {
                    $scope.page = 1;
                    initialLoadingPage = false;
                }

                if ($scope.filters.realm && $scope.filters.region == $scope.realmRegion) {
                    $scope.path = "pve/" + $scope.filters.region + "/" + $scope.filters.realm + "/";
                    $state.go('progressRealm', {
                        region: $scope.filters.region,
                        realm: $scope.filters.realm,
                        page: null
                    }, {notify: false});
                } else if ($scope.filters.region) {
                    $scope.path = "pve/" + $scope.filters.region + "/";
                    $state.go('progressRegion', {region: $scope.filters.region, page: null}, {notify: false});
                } else {
                    $scope.path = "pve/";
                    $state.go('progress', {page: null}, {notify: false});
                }
            }

            $scope.ranking = [];
            getRankings();

            initialLoading = true;
        }, true);

        $scope.$watch('page', function () {
            if ($scope.page >= 1) {
                if (initialLoadingPage) {
                    if ($scope.page != $scope.lastPage) {
                        if ($scope.filters.realm && $scope.filters.region == $scope.realmRegion) {
                            $scope.path = "pve/" + $scope.filters.region + "/" + $scope.filters.realm + "/";
                            $state.go('progressRealm', {
                                region: $scope.filters.region,
                                realm: $scope.filters.realm,
                                page: $scope.page
                            }, {notify: false});
                        } else if ($scope.filters.region) {
                            $scope.path = "pve/" + $scope.filters.region + "/";
                            $state.go('progressRegion', {region: $scope.filters.region, page: $scope.page}, {notify: false});
                        } else {
                            $scope.path = "pve/";
                            $state.go('progress', {page: $scope.page}, {notify: false});
                        }
                        $scope.lastPage = $scope.page;
                    }

                    $scope.ranking = [];
                    getRankings();
                }
            }

            initialLoadingPage = true;
        });

        $scope.$parent.loading = false;

        function getRankings() {
            $scope.loading = true;
            var query;

            query = angular.copy($scope.filters);

            query.raid = __env.tiers[query.tier].name;
            $scope.raidName = query.raid;
            var realTier = query.tier.split('.');
            query.tier = realTier[0];

            if (__env.rankingRegions[query.region]) {
                query.region = __env.rankingRegions[query.region];
            } else {
                query.region = __env.rankingSubregions[query.region];
            }
            query.limit = 20;
            query.start = (($scope.page - 1) * 20) + 1;

            $scope.noResults = false;
            $scope.rankings = [];
            ranking.get(query, function (ranking) {
                if (ranking) {
                    $scope.rankings = ranking;
                    if (Object.keys(ranking).length <= 2) {
                        $scope.noResults = true;
                    }
                }
                $scope.loading = false;
            });

            stats.get({
                "tier":  __env.tiers[$scope.filters.tier].tier,
                "raid": __env.tiers[$scope.filters.tier].name,
                "type": "guild",
                "limit": 1
            }, function (stats) {
                $scope.stats = stats[0];
            });
        }

        /* Realm stuff */
        $scope.setRealm = function (data) {
            $scope.filters.region = data.region;
            $scope.realmRegion = data.region;
            $scope.filters.realm = data.name;
            //$scope.realmOut = data;
        };

        $scope.resetRealm = function () {
            $scope.filters.realm = null;
            angular.forEach($scope.realms, function (realm) {
                realm.selected = false;
            });
        };

        $scope.backPage = function() {
            if ($scope.page > 1) {
                $scope.page--;
            }
        };

        $scope.nextPage = function() {
            $scope.page++;
        };

        $scope.$on('get:realms', function () {
            var realm_zone = "";
            if ($scope.filters.region && __env.realms[$scope.filters.region]) {
                realm_zone = __env.realms[$scope.filters.region];
            }
            realms.query({realm_zone: realm_zone}, function (realms) {
                $scope.realms = realms;
                var realmIsInRealmZone = false;
                angular.forEach(realms, function (realm) {
                    realm.label = realm.name + " (" + realm.region.toUpperCase() + ")";
                    if ($stateParams.realm == realm.name || $scope.filters.realm == realm.name) {
                        realm.selected = true;
                        $scope.realmRegion = realm.region;
                    }
                });
            });
        });
    }
})();
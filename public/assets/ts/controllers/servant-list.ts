'use strict';

//import * as angular from 'angular';
import * as app from '../app';
import {ServantService} from '../services/servant';
import {ScrollService} from '../services/scroll';
import {ServantModel, SkillModel, StatusModel} from '../models/servant';

interface ServantListParams extends ng.route.IRouteParamsService {
  tribe_id: string;
  q: string;
}

class ServantListController {
  public tribeIdOptions: {key: number; value: string;}[] = [
    {key: 0, value: 'Select Tribe...'},
    {key: 1, value: '人獣'},
    {key: 2, value: '神族'},
    {key: 3, value: '魔種'},
    {key: 4, value: '海種'},
    {key: 5, value: '不死'}
  ];

  public servants: ServantModel[];
  public tribeId: number;
  public q: string;
  public filter: { [key: string]: string; } = {
    tribeId: undefined,
    name: undefined,
    type: undefined,
    range: undefined,
    cost: undefined,
    illustrationBy: undefined,
    characterVoice: undefined
  };
  public predicate: string[] = ['tribeId', 'tribeCode'];
  public reverse: boolean = false;

  public static $inject = [
    '$scope',
    '$window',
    '$location',
    '$routeParams',
    'ServantService',
    'ScrollService'
  ];

  constructor(
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private $routeParams: ServantListParams,
    private servantService: ServantService,
    private scrollService: ScrollService
  ) {
    this.tribeId = $routeParams.tribe_id ? +$routeParams.tribe_id : 0;
    this.q = $routeParams.q ? $routeParams.q : '';
    this.updateFilter();

    servantService.load()
      .then((servants) => {
        this.servants = servants;
        this.scrollService.restore();
        $window.setTimeout(() => {
          angular.element('table.table').DataTable({
            paging: false,
            searching: false,
            columnDefs: [
              { orderable: false, targets: 1 },
              { orderSequence: ['desc', 'asc'], targets: [6, 7, 8, 9] },
            ]
          });
        });
      });

    $scope.$watch(() => this.tribeId, (newValue, oldValue) => {
      if (typeof newValue === 'undefined'
        || typeof oldValue === 'undefined'
        || newValue == oldValue) {
        return;
      }
      this.selectTribeId(this.tribeId);
    }, true);
  }

  public selectView(view: number): void {
    this.$location.url(this.$location.search('view', view).url());
  }

  public selectTribeId(tribeId: number): void {
    this.$location.url(this.$location.search('tribe_id', tribeId).url());
  }

  public changeQuery(): void {
    this.updateFilter();
  }

  public openServant(servant: ServantModel): void {
    this.$location.url('/servants/' + servant.id + '/');
  }

  private updateFilter() {
    let params = this.parseQuery(this.q);
    Object.keys(this.filter).forEach((key) => {
      this.filter[key] = params[key];
    });
    this.filter['tribeId'] = +this.tribeId ? ''+this.tribeId : undefined;
  }

  private parseQuery(query: string): { [index: string]: string; } {
    let params: { [index: string]: string; } = {};
    query.split(/[\s　]/i).forEach(function(e) {
      let [key, value] = e.split(':');
      if (!value) {
        params['name'] = key;
        return;
      }
      params[key] = value.replace('+', ' ');
    });
    return params;
  }
}

class Definition {
  static ddo() {
    return {
      controller: ServantListController,
      controllerAs: 'c',
      restrict: 'E',
      templateUrl: '/assets/templates/servant-list.html'
    };
  }
}

angular.module('app').directive('lovaServantList', Definition.ddo);
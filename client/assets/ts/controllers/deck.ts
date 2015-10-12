'use strict';

//import * as angular from 'angular';
import * as app from '../app';
import {ServantService} from '../services/servant';
import {DeckService} from '../services/deck';
import {ServantModel, SkillModel, StatusModel} from '../models/servant';
import {DeckModel} from '../models/deck';

interface DeckParams extends ng.route.IRouteParamsService {
  hash: string;
}

class DeckController {
  public servants: ServantModel[];

  public tribeIdOptions: {key: number; value: string;}[] = [
    {key: 0, value: 'Select Tribe...'},
    {key: 1, value: '人獣'},
    {key: 2, value: '神族'},
    {key: 3, value: '魔種'},
    {key: 4, value: '海種'},
    {key: 5, value: '不死'}
  ];

  public tribeId: number;

  public tribeName: string = 'Select Tribe...';

  public q: string;

  public filter: {
    tribeId: number;
    name: string;
  } = {
    tribeId: undefined,
    name: undefined
  };

  public predicate: string[] = ['tribeId', 'tribeCode'];

  public reverse: boolean = false;

  public url: string;

  public deck: DeckModel;

  public static $inject = [
    '$window',
    '$location',
    '$routeParams',
    'ServantService',
    'DeckService'
  ];

  constructor(
    private $window: ng.IWindowService,
    private $location: ng.ILocationService,
    private $routeParams: DeckParams,
    private servantService: ServantService,
    private deckService: DeckService
  ) {
    servantService.load()
      .then((servants: ServantModel[]) => {
        this.servants = servants;
        this.deck = deckService.getDeckWithHash($routeParams.hash, servants);
        this.url = deckService.getUrlWithDeck(this.deck);
        this.refreshEventListener();
      });

    angular.element($window.document).ready(() => {
      let button = angular.element('.copy-clipboard');
      let clip = new ZeroClipboard(button);
      clip.on('ready', () => {
        clip.on('aftercopy', () => {
          button
            .attr('data-original-title', 'Copied')
            .tooltip('show');
          $window.setTimeout(() => {
            button
              .tooltip('hide')
              .attr('data-original-title', '');
          }, 1000);
        });
      });
      button
        .tooltip({
          trigger: 'manual',
          container: 'body'
        });
    });
  }

  public setServant(index: number, data: {servant: ServantModel; index: number}): void {
    let servant = data.servant;
    let oldIndex = data.index;
    if (oldIndex !== null) {
      this.deck.servants[oldIndex] = this.deck.servants[index] ? this.deck.servants[index] : undefined;
    }
    this.deck.servants[index] = servant;
    this.url = this.deckService.getUrlWithDeck(this.deck);
    this.refreshEventListener();
  }

  public clearServant(index: number): void {
    this.deck.servants[index] = undefined;
    this.url = this.deckService.getUrlWithDeck(this.deck);
    this.refreshEventListener();
  }

  public selectTribeId(tribeId: number, tribeName: string): void {
    this.tribeId = tribeId;
    this.tribeName = tribeName;
    this.filter.tribeId = this.tribeId ? this.tribeId : undefined;
    this.refreshEventListener();
  }

  public changeQuery(): void {
    this.filter.name = this.q;
    this.refreshEventListener();
  }

  public openServant(servantId: number): void {
    this.$window.open('/servants/' + servantId + '/', '_blank');
  }

  private refreshEventListener(): void {
    this.$window.setTimeout(() => {
      //noinspection TaskProblemsInspection
      angular.element('img.lazy').lazyload();
    }, 1);
  }
}

class Definition {
  static ddo() {
    return {
      controller: DeckController,
      controllerAs: 'c',
      restrict: 'E',
      templateUrl: '/assets/templates/deck.html'
    };
  }
}

angular.module('app').directive('lovaDeck', Definition.ddo);

<template>
  <div>
    <creator-intro />
    <profileModal />
    <report-flag-modal />
    <send-gift-modal />
    <select-user-modal />
    <b-navbar
      id="habitica-menu"
      class="topbar navbar-inverse static-top"
      toggleable="lg"
      type="dark"
    >
      <b-navbar-brand
        class="brand"
        aria-label="Habitica"
      >
        <div
          class="logo svg-icon d-none d-xl-block"
          v-html="icons.logo"
        ></div>
        <div class="svg-icon gryphon d-xs-block d-xl-none"></div>
      </b-navbar-brand>
      <b-navbar-toggle
        class="menu-toggle"
        target="menu_collapse"
      />
      <div class="quick-menu mobile-only form-inline">
        <a
          v-b-tooltip.hover.bottom="$t('sync')"
          class="item-with-icon"
          :aria-label="$t('sync')"
          @click="sync"
        >
          <div
            class="top-menu-icon svg-icon"
            v-html="icons.sync"
          ></div>
        </a>
        <notification-menu class="item-with-icon" />
        <user-dropdown class="item-with-icon" />
      </div>
      <b-collapse
        id="menu_collapse"
        v-model="menuIsOpen"
        class="collapse navbar-collapse"
      >
        <b-navbar-nav class="menu-list">
          <b-nav-item
            class="topbar-item"
            :class="{'active': $route.path === '/'}"
            tag="li"
            :to="{name: 'tasks'}"
            exact="exact"
          >
            {{ $t('tasks') }}
          </b-nav-item>
          <li
            class="topbar-item droppable"
            :class="{
              'active': $route.path.startsWith('/inventory')}"
          >
            <div
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="{name: 'items'}"
            >
              {{ $t('inventory') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'items'}"
                exact="exact"
              >
                {{ $t('items') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'equipment'}"
              >
                {{ $t('equipment') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'stable'}"
              >
                {{ $t('stable') }}
              </router-link>
            </div>
          </li>
          <li
            class="topbar-item droppable"
            :class="{
              'active': $route.path.startsWith('/shop')}"
          >
            <div
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="{name: 'market'}"
            >
              {{ $t('shops') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'market'}"
                exact="exact"
              >
                {{ $t('market') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'quests'}"
              >
                {{ $t('quests') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'seasonal'}"
              >
                {{ $t('titleSeasonalShop') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'time'}"
              >
                {{ $t('titleTimeTravelers') }}
              </router-link>
            </div>
          </li>
          <b-nav-item
            v-if="user.party._id && user._id !== partyLeaderId"
            class="topbar-item"
            :class="{'active': $route.path.startsWith('/party')}"
            tag="li"
            :to="{name: 'party'}"
          >
            {{ $t('party') }}
          </b-nav-item>
          <li
            v-if="user.party._id && user._id === partyLeaderId"
            class="topbar-item droppable"
            :class="{'active': $route.path.startsWith('/party')}"
          >
            <div
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="{name: 'party'}"
            >
              {{ $t('party') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'lookingForParty'}"
              >
                {{ $t('lookingForPartyTitle') }}
              </router-link>
            </div>
          </li>
          <b-nav-item
            v-if="!user.party._id"
            class="topbar-item"
            :class="{'active': $route.path.startsWith('/party')}"
            @click="openPartyModal()"
          >
            {{ $t('party') }}
          </b-nav-item>
          <li
            class="topbar-item droppable"
            :class="{
              'active': $route.path.startsWith('/group-plans')}"
          >
            <div
              v-if="groupPlans && groupPlans.length > 0"
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="groupPlanTopLink"
            >
              {{ $t('group') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                v-for="group in groupPlans"
                :key="group._id"
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'groupPlanDetailTaskInformation', params: {groupId: group._id}}"
              >
                {{ group.name }}
              </router-link>
            </div>
          </li>
          <li
            class="topbar-item droppable"
            :class="{
              'active': $route.path.startsWith('/challenges')}"
          >
            <div
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="{name: 'myChallenges'}"
            >
              {{ $t('challenges') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'myChallenges'}"
              >
                {{ $t('myChallenges') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'findChallenges'}"
              >
                {{ $t('findChallenges') }}
              </router-link>
            </div>
          </li>
          <li
            class="topbar-item droppable"
            :class="{
              'active': $route.path.startsWith('/help')}"
          >
            <div
              class="chevron rotate"
              @click="dropdownMobile($event)"
            >
              <div
                v-once
                class="chevron-icon-down"
                v-html="icons.chevronDown"
              ></div>
            </div>
            <router-link
              class="nav-link"
              :to="{name: 'faq'}"
            >
              {{ $t('help') }}
            </router-link>
            <div class="topbar-dropdown">
              <router-link
                v-if="user.permissions.fullAccess ||
                  user.permissions.userSupport || user.permissions.newsPoster"
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'adminPanel'}"
              >
                Admin Panel
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'faq'}"
              >
                {{ $t('faq') }}
              </router-link>
              <router-link
                class="topbar-dropdown-item dropdown-item"
                :to="{name: 'overview'}"
              >
                {{ $t('overview') }}
              </router-link>
              <a
                class="topbar-dropdown-item dropdown-item"
                target="_blank"
                @click.prevent="openBugReportModal()"
              >
                {{ $t('reportBug') }}
              </a>
              <a
                class="topbar-dropdown-item dropdown-item"
                target="_blank"
                @click.prevent="openBugReportModal(true)"
              >
                {{ $t('askQuestion') }}
              </a>
              <a
                class="topbar-dropdown-item dropdown-item"
                href="https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link"
                target="_blank"
              >{{ $t('requestFeature') }}</a>
              <a
                class="topbar-dropdown-item dropdown-item"
                href="https://habitica.fandom.com/wiki/Habitica_Wiki"
                target="_blank"
              >{{ $t('wiki') }}</a>
            </div>
          </li>
        </b-navbar-nav>
        <div class="currency-tray form-inline">
          <div
            v-if="userHourglasses > 0"
            class="item-with-icon"
          >
            <div
              v-b-tooltip.hover.bottom="$t('mysticHourglassesTooltip')"
              class="top-menu-icon svg-icon"
              v-html="icons.hourglasses"
            ></div>
            <span>{{ userHourglasses }}</span>
          </div>
          <div class="item-with-icon">
            <a
              v-b-tooltip.hover.bottom="$t('gems')"
              class="top-menu-icon svg-icon gem"
              :aria-label="$t('gems')"
              href="#buy-gems"
              @click.prevent="showBuyGemsModal()"
              v-html="icons.gem"
            ></a>
            <span>{{ userGems }}</span>
          </div>
          <div class="item-with-icon gold">
            <div
              v-b-tooltip.hover.bottom="$t('gold')"
              class="top-menu-icon svg-icon"
              :aria-label="$t('gold')"
              v-html="icons.gold"
            ></div>
            <span>{{ Math.floor(user.stats.gp * 100) / 100 }}</span>
          </div>
        </div>
        <div class="form-inline desktop-only">
          <a
            v-b-tooltip.hover.bottom="$t('sync')"
            class="item-with-icon"
            role="link"
            :aria-label="$t('sync')"
            tabindex="0"
            @click="sync"
            @keyup.enter="sync"
          >
            <div
              class="top-menu-icon svg-icon"
              v-html="icons.sync"
            ></div>
          </a>
          <notification-menu class="item-with-icon" />
          <user-dropdown class="item-with-icon" />
        </div>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<style lang="scss">
body.modal-open #habitica-menu {
  z-index: 1035;
}
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/utils.scss';
  @import '~@/assets/scss/variables.scss';

  @media only screen and (max-width: 1200px) {
    .chevron {
      display: none
    }

    .gryphon {
      background-image: url('~@/assets/images/melior@3x.png');
      width: 30px;
      height: 30px;
      background-size: cover;
      color: $white;
      margin: 0 auto;
    }

    .topbar-item {
      font-size: 14px !important;
    }
  }

  @media only screen and (min-width: 992px) {
    .chevron {
      display: none
    }

    .mobile-only {
      display: none !important;
    }

    .topbar {
      max-height: $menuToolbarHeight;

      .currency-tray {
        margin-left: auto;
      }

      .topbar-item {
        padding-top: 5px;
        height: 56px;

        &:hover {
          background: $purple-200;
        }

        &.active:not(:hover) {
          box-shadow: 0px -4px 0px $purple-300 inset;
        }
      }

      .topbar-dropdown {
        position: absolute;
      }
    }
  }

  @media only screen and (max-width: 992px) {
    .brand {
      margin: 0;
    }

    .gryphon {
      position: absolute;
      left: calc(50% - 30px);
      top: 10px;
    }

    #menu_collapse {
      margin: 0.6em -16px -8px;
      overflow: auto;
      flex-direction: column;
      background-color: $purple-100;

      .menu-list {
        width: 100%;
        order: 1;
        text-align: center;

        .topbar-dropdown  {
          transition: max-height 0.25s ease;
        }

        .topbar-dropdown-item {
          background: #432874;
          border-bottom: #6133b4 solid 1px;
        }

        .chevron {
          width: 20%;
          height: 42px;
          position: absolute;
          right: 0;
          top: 0;
          display: block;
        }

        .chevron-icon-down {
          width: 14px;
          top: 11px;
          right: 12px;
          position: absolute;
          display: block;
          transition: transform 0.25s ease;
        }

        .down .rotate .chevron-icon-down {
          transform: rotate(-180deg);
          }

        .topbar-item {
          position: relative;

          &.active {
            background: #6133b4;
          }

          background: #4f2a93;
          border-bottom: #6133b4 solid 1px;
        }
      }
    }

    .currency-tray {
      justify-content: center;
      min-height: 40px;
      background: #271b3d;
      width: 100%;
    }

    .desktop-only {
      display: none !important;
    }
  }

  .menu-toggle {
    border: none;
  }

  #menu_collapse {
    display: flex;
    justify-content: space-between;
  }

  .topbar {
    z-index: 1080;
    background: $purple-100 url(~@/assets/svg/for-css/bits.svg) right top no-repeat;
    min-height: 56px;
    box-shadow: 0 1px 2px 0 rgba($black, 0.24);

    a {
      color: white !important;
    }
  }

  .logo {
    padding-left: 10px;
    width: 128px;
    height: 28px;
  }

  .quick-menu {
    display: flex;
    margin-left: auto;
  }

  .currency-tray {
    display: flex;
  }

  .topbar-item {
    font-size: 16px;
    color: $white !important;
    font-weight: bold;
    transition: none;

    .topbar-dropdown  {
        overflow: hidden;
        max-height: 0;

        .topbar-dropdown-item {
          line-height: 1.5;
          font-size: 16px;
        }
    }

    >a {
      padding: .8em 1em !important;
    }

    &.down {
      color: $white !important;
      background: $purple-200;

      .topbar-dropdown {
        margin-top: 0; // Remove gap between navbar and drop-down.
        background: $purple-200;
        border-radius: 0px;
        border: none;
        box-shadow: none;
        padding: 0px;

        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;

        .topbar-dropdown-item {
          font-size: 16px;
          box-shadow: none;
          color: $white;
          border: none;
          line-height: 1.5;
          display: list-item;

          &.active {
            background: $purple-300;
          }

          &:hover {
            background: $purple-300;
            text-decoration: none;

            &:last-child {
              border-bottom-right-radius: 5px;
              border-bottom-left-radius: 5px;
            }
          }
        }
      }
    }
  }

  .dropdown + .dropdown {
    margin-left: 0px;
  }

  .item-with-icon {
    color: $white;
    font-size: 16px;
    font-weight: normal;
    white-space: nowrap;

    span {
      font-weight: bold;
    }

    &.gold {
      margin-right: 24px;
    }

    &:focus ::v-deep .top-menu-icon.svg-icon,
    &:hover ::v-deep .top-menu-icon.svg-icon {
      color: $white;
    }

    & ::v-deep .top-menu-icon.svg-icon {
      color: $header-color;
      vertical-align: bottom;
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 12px;
      margin-left: 12px;
    }
  }

  a.item-with-icon:focus {
    outline: none;
  }

  .menu-icon {
    margin-left: 24px;
  }

  @keyframes rotateGemColors {
    /* Gems are green by default, so we rotate through ROYGBIV starting with green. */
    20% {
      fill: #46A7D9; /* Blue */
    }
    40% {
      fill: #925CF3; /* Purple */
    }
    60% {
      fill: #DE3F3F; /* Red */
    }
    80% {
      fill: #FA8537; /* Orange */
    }
    100% {
      fill: #FFB445; /* Yellow */
    }
  }

  .gem:hover {
    cursor: pointer;

    & ::v-deep path:nth-child(1) {
      animation: rotateGemColors 3s linear infinite alternate;
    }
  }

  .message-count {
    background-color: $blue-50;
    border-radius: 50%;
    height: 20px;
    width: 20px;
    float: right;
    color: $white;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
  }

  .message-count.top-count {
    background-color: $red-50;
    position: absolute;
    right: 0;
    top: -0.5em;
    padding: .2em;
  }
</style>

<script>
import { mapState, mapGetters } from '@/libs/store';
import { goToModForm } from '@/libs/modform';

import gemIcon from '@/assets/svg/gem.svg';
import goldIcon from '@/assets/svg/gold.svg';
import syncIcon from '@/assets/svg/sync.svg';
import svgHourglasses from '@/assets/svg/hourglass.svg';
import chevronDownIcon from '@/assets/svg/chevron-down.svg';
import logo from '@/assets/svg/logo.svg';

import creatorIntro from '../creatorIntro';
import notificationMenu from './notificationsDropdown';
import profileModal from '../userMenu/profileModal';
import reportFlagModal from '../chat/reportFlagModal';
import sendGiftModal from '@/components/payments/sendGiftModal';
import selectUserModal from '@/components/payments/selectUserModal';
import sync from '@/mixins/sync';
import userDropdown from './userDropdown';
import reportBug from '@/mixins/reportBug.js';

export default {
  components: {
    creatorIntro,
    notificationMenu,
    profileModal,
    reportFlagModal,
    sendGiftModal,
    selectUserModal,
    userDropdown,
  },
  mixins: [sync, reportBug],
  data () {
    return {
      isUserDropdownOpen: false,
      menuIsOpen: false,
      partyLeaderId: null,
      icons: Object.freeze({
        gem: gemIcon,
        gold: goldIcon,
        hourglasses: svgHourglasses,
        sync: syncIcon,
        logo,
        chevronDown: chevronDownIcon,
      }),
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({
      user: 'user.data',
      userHourglasses: 'user.data.purchased.plan.consecutive.trinkets',
      groupPlans: 'groupPlans.data',
      modalStack: 'modalStack',
    }),
    groupPlanTopLink () {
      if (!this.groupPlans || this.groupPlans.length === 0) return { name: 'groupPlan' };
      return {
        name: 'groupPlanDetailTaskInformation',
        params: { groupId: this.groupPlans[0]._id },
      };
    },
  },
  async mounted () {
    await this.getUserGroupPlans();
    await this.getUserParty();
    if (document.getElementById('menu_collapse')) {
      Array.from(document.getElementById('menu_collapse').getElementsByTagName('a')).forEach(link => {
        link.addEventListener('click', this.closeMenu);
      });
    }
    Array.from(document.getElementsByClassName('topbar-item')).forEach(link => {
      link.addEventListener('mouseenter', this.dropdownDesktop);
      link.addEventListener('mouseleave', this.dropdownDesktop);
    });
    this.$root.$on('update-party', () => {
      this.getUserParty();
    });
  },
  methods: {
    modForm () {
      goToModForm(this.user);
    },
    toggleUserDropdown () {
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
    },
    async getUserGroupPlans () {
      await this.$store.dispatch('guilds:getGroupPlans');
    },
    async getUserParty () {
      if (this.user.party._id) {
        await this.$store.dispatch('party:getParty');
        this.partyLeaderId = this.$store.state.party.data.leader._id;
      }
    },
    openPartyModal () {
      this.$root.$emit('bv::show::modal', 'create-party-modal');
    },
    showBuyGemsModal () {
      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
    dropdownDesktop (hover) {
      if (this.isDesktop() && hover.target.classList.contains('droppable')) {
        if (hover.type === 'mouseenter') {
          this.openDropdown(hover.target);
        } else {
          this.closeDropdown(hover.target);
        }
      }
    },
    dropdownMobile (click) {
      const element = click.currentTarget.parentElement;
      const droppedElement = document.getElementsByClassName('down')[0];
      if (droppedElement && droppedElement !== element) {
        droppedElement.classList.remove('down');
        if (droppedElement.lastChild) {
          droppedElement.lastChild.style.maxHeight = 0;
        }
      }
      if (element.classList.contains('down')) {
        this.closeDropdown(element);
      } else {
        this.openDropdown(element);
      }
    },
    closeDropdown (element) {
      element.classList.remove('down');
      element.lastChild.style.maxHeight = 0;
    },
    openDropdown (element) {
      element.classList.add('down');
      element.lastChild.style.maxHeight = `${element.lastChild.scrollHeight}px`;
    },
    closeMenu () {
      Array.from(document.getElementsByClassName('droppable')).forEach(droppableElement => {
        this.closeDropdown(droppableElement);
      });
      if (this.isMobile()) {
        this.menuIsOpen = false;
      }
    },
    isMobile () {
      return document.documentElement.clientWidth < 992;
    },
    isDesktop () {
      return !this.isMobile();
    },
  },
};
</script>

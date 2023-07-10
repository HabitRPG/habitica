<template>
  <b-modal
    id="avatar-modal"
    title
    :size="editing ? 'lg' : 'md'"
    :hide-header="true"
    :hide-footer="true"
    :modal-class="{'page-2':modalPage > 1 && !editing}"
    :no-close-on-esc="!editing"
    :no-close-on-backdrop="!editing"
  >
    <span
      v-if="editing"
      class="close-icon svg-icon inline icon-10"
      @click="close()"
      v-html="icons.close"
    ></span>
    <div
      v-if="modalPage === 1 && !editing"
      class="section row welcome-section"
    >
      <div class="col-6 offset-3 text-center">
        <h3 v-once>
          {{ $t('welcomeTo') }}
        </h3>
        <div
          class="svg-icon logo"
          v-html="icons.logoPurple"
        ></div>
      </div>
    </div>
    <div
      v-if="modalPage > 1"
      class="avatar-section row"
      :class="{'page-2': modalPage === 2}"
    >
      <div class="col-6 offset-3">
        <div
          v-if="!editing"
          class="user-creation-bg"
        ></div>
        <avatar
          :member="user"
          :avatar-only="!editing"
          :class="{'edit-avatar': editing}"
        />
      </div>
    </div>
    <div
      v-if="modalPage === 2"
      class="section"
      :class="{'edit-modal': editing}"
    >
      <!-- @TODO Implement in V2 .section.row.col-12.text-center
      button.btn.btn-secondary(v-once) {{$t('randomize')}}-->
      <div
        id="options-nav"
        class="container section text-center customize-menu"
      >
        <div class="row">
          <div
            class="menu-container"
            :class="{
              'col-3': !editing,
              'col-2 offset-1': editing,
              active: activeTopPage === 'body'}"
            @click="changeTopPage('body', 'size')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.bodyIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('bodyBody') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{'col-3': !editing, 'col-2': editing, active: activeTopPage === 'skin'}"
            @click="changeTopPage('skin', 'color')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.skinIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('skin') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{'col-3': !editing, 'col-2': editing, active: activeTopPage === 'hair'}"
            @click="changeTopPage('hair', 'color')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.hairIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('hair') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{'col-3': !editing, 'col-2': editing, active: activeTopPage === 'extra'}"
            @click="changeTopPage('extra', 'glasses')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.accessoriesIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('extra') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            v-if="editing"
            class="menu-container col-2"
            :class="{active: activeTopPage === 'backgrounds'}"
            @click="changeTopPage('backgrounds', '2023')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.backgroundsIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('backgrounds') }}</strong>
            <div class="indicator"></div>
          </div>
        </div>
      </div>
      <body-settings
        v-if="activeTopPage === 'body'"
        :editing="editing"
      />
      <skin-settings
        v-if="activeTopPage === 'skin'"
        :editing="editing"
      />
      <hairSettings
        v-if="activeTopPage === 'hair'"
        :editing="editing"
      />
      <extraSettings
        v-if="activeTopPage === 'extra'"
        :editing="editing"
      />
      <div
        v-if="activeTopPage === 'backgrounds'"
        id="backgrounds"
        class="section container customize-section"
      >
        <div class="row title-row">
          <toggle-switch
            v-model="filterBackgrounds"
            class="backgroundFilterToggle"
            :label="$t('hideLockedBackgrounds')"
          />
        </div>
        <div
          v-if="!filterBackgrounds"
          class="row text-center title-row"
        >
          <strong>{{ backgroundShopSets[0].text }}</strong>
        </div>
        <div
          v-if="!filterBackgrounds"
          class="row title-row"
        >
          <div
            v-if="showPlainBackgroundBlurb(
              backgroundShopSets[0].identifier, backgroundShopSets[0].items
            )"
            class="col-12"
          >
            {{ $t('incentiveBackgroundsUnlockedWithCheckins') }}
          </div>
          <div
            v-for="bg in backgroundShopSets[0].items"
            :key="bg.key"
            :id="bg.key"
            class="col-2"
            @click="unlock('background.' + bg.key)"
          >
            <div
              class="incentive-background"
              :class="[`background_${bg.key}`]"
            >
              <div class="small-rectangle"></div>
            </div>
            <b-popover
              :target="bg.key"
              triggers="hover focus"
              placement="bottom"
              :prevent-overflow="false"
              :content="bg.notes"
            />
          </div>
        </div>
        <div
          v-if="!filterBackgrounds && user.purchased.background.birthday_bash"
        >
          <div
            class="row text-center title-row"
          >
            <strong>{{ backgroundShopSets[2].text }}</strong>
          </div>
          <div
            class="row title-row"
          >
            <div
              v-for="bg in backgroundShopSets[2].items"
              :key="bg.key"
              :id="bg.key"
              class="col-4 text-center customize-option background-button"
              @click="unlock('background.' + bg.key)"
            >
              <div
                class="background"
                :class="`background_${bg.key}`"
              ></div>
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes"
              />
            </div>
          </div>
        </div>
        <div v-if="!filterBackgrounds">
          <div
            class="row text-center title-row"
          >
            <strong>{{ backgroundShopSets[1].text }}</strong>
          </div>
          <div
            class="row title-row"
          >
            <div
              v-for="bg in backgroundShopSets[1].items"
              :key="bg.key"
              :id="bg.key"
              class="col-4 text-center customize-option background-button"
              @click="!user.purchased.background[bg.key]
                ? backgroundSelected(bg) : unlock('background.' + bg.key)"
            >
              <div
                class="background"
                :class="[`background_${bg.key}`, backgroundLockedStatus(bg.key)]"
              ></div>
              <i
                v-if="!user.purchased.background[bg.key]"
                class="glyphicon glyphicon-lock"
              ></i>
              <div
                v-if="!user.purchased.background[bg.key]"
                class="purchase-background single d-flex align-items-center justify-content-center"
              >
                <div
                  class="svg-icon hourglass"
                  v-html="icons.hourglass"
                ></div>
                <span class="price">1</span>
              </div>
              <span
                v-if="!user.purchased.background[bg.key]"
                class="badge-top"
                @click.stop.prevent="togglePinned(bg)"
              >
                <pin-badge
                  :pinned="isBackgroundPinned(bg)"
                />
              </span>
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes"
              />
            </div>
          </div>
        </div>
        <sub-menu
          v-if="!filterBackgrounds"
          class="text-center"
          :items="bgSubMenuItems"
          :active-sub-page="activeSubPage"
          @changeSubPage="changeSubPage($event)"
        />
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <div
          v-for="(sets, key) in backgroundShopSetsByYear"
          v-if="!filterBackgrounds"
          :key="key"
          class="row customize-menu"
        >
          <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          <!-- eslint-disable vue/no-use-v-if-with-v-for -->
          <div
            v-for="set in sets"
            v-if="activeSubPage === key"
            :key="set.identifier"
            class="row background-set"
          >
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
            <div class="col-8 offset-2 text-center set-title">
              <strong>{{ set.text }}</strong>
            </div>
            <div
              v-for="bg in set.items"
              :key="bg.key"
              :id="bg.key"
              class="col-4 text-center customize-option background-button"
              @click="!user.purchased.background[bg.key]
                ? backgroundSelected(bg) : unlock('background.' + bg.key)"
            >
              <div
                class="background"
                :class="[`background_${bg.key}`, backgroundLockedStatus(bg.key)]"
              ></div>
              <i
                v-if="!user.purchased.background[bg.key]"
                class="glyphicon glyphicon-lock"
              ></i>
              <div
                v-if="!user.purchased.background[bg.key]"
                class="purchase-background single d-flex align-items-center justify-content-center"
              >
                <div
                  class="svg-icon gem"
                  v-html="icons.gem"
                ></div>
                <span class="price">7</span>
              </div>
              <span
                v-if="!user.purchased.background[bg.key]"
                class="badge-top"
                @click.stop.prevent="togglePinned(bg)"
              >
                <pin-badge
                  :pinned="isBackgroundPinned(bg)"
                />
              </span>
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes"
              />
            </div>
            <div
              v-if="!ownsSet('background', set.items) && set.identifier !== 'incentiveBackgrounds'"
              class="purchase-background set"
              @click="unlock(setKeys('background', set.items))"
            >
              <span class="label">{{ $t('purchaseAll') }}</span>
              <div
                class="svg-icon gem"
                v-html="icons.gem"
              ></div>
              <span class="price">15</span>
            </div>
          </div>
        </div>
        <div
          v-if="filterBackgrounds"
          class="row customize-menu"
        >
          <div
            v-for="(bg) in ownedBackgrounds"
            :key="bg.key"
            :id="bg.key"
            class="col-4 text-center customize-option background-button"
            @click="unlock('background.' + bg.key)"
          >
            <div
              class="background"
              :class="[`background_${bg.key}`, backgroundLockedStatus(bg.key)]"
            ></div>
            <b-popover
              :target="bg.key"
              triggers="hover focus"
              placement="bottom"
              :prevent-overflow="false"
              :content="bg.notes"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="modalPage === 3 && !editing"
      class="container interests-section"
    >
      <div class="section row">
        <div class="col-12 text-center">
          <h2>{{ $t('wantToWorkOn') }}</h2>
        </div>
      </div>
      <div class="section row">
        <div class="col-6">
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="work"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="work"
              >
              <label
                v-once
                class="custom-control-label"
                for="work"
              >{{ $t('work') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="exercise"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="exercise"
              >
              <label
                v-once
                class="custom-control-label"
                for="exercise"
              >{{ $t('exercise') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="health_wellness"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="health_wellness"
              >
              <label
                v-once
                class="custom-control-label"
                for="health_wellness"
              >{{ $t('health_wellness') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="school"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="school"
              >
              <label
                v-once
                class="custom-control-label"
                for="school"
              >{{ $t('school') }}</label>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="chores"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="chores"
              >
              <label
                v-once
                class="custom-control-label"
                for="chores"
              >{{ $t('chores') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="creativity"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="creativity"
              >
              <label
                v-once
                class="custom-control-label"
                for="creativity"
              >{{ $t('creativity') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="self_care"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="self_care"
              >
              <label
                v-once
                class="custom-control-label"
                for="self_care"
              >{{ $t('self_care') }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!editing"
      class="section d-flex justify-content-center justin-outer-section"
      :class="{top: modalPage > 1}"
    >
      <div class="justin-section d-flex align-items-center">
        <div class="featured-label">
          <span class="rectangle"></span>
          <span class="text">Justin</span>
          <span class="rectangle"></span>
        </div>
        <div class="justin-message">
          <div
            class="corner-decoration"
            :style="{top: '-2px', right: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{top: '-2px', left: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{bottom: '-2px', right: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{bottom: '-2px', left: '-2px'}"
          ></div>
          <div v-if="modalPage === 1">
            <p
              v-once
              v-html="$t('justinIntroMessage1')"
            ></p>
            <p v-once>
              {{ $t('justinIntroMessageUsername') }}
            </p>
          </div>
          <div v-if="modalPage === 2">
            <p>{{ $t('justinIntroMessageAppearance') }}</p>
          </div>
          <div v-if="modalPage === 3">
            <p v-once>
              {{ $t('justinIntroMessage3') }}
            </p>
          </div>
        </div>
        <div
          class="npc-justin-textbox"
          :style="{'background-image': imageURL}"
        ></div>
      </div>
    </div>
    <div
      v-if="modalPage === 1"
      class="section mr-5 ml-5 first-page-footer"
    >
      <username-form
        :avatar-intro="true"
        @usernameConfirmed="modalPage += 1"
      />
      <div
        class="small text-center"
        v-html="$t('usernameTOSRequirements')"
      ></div>
    </div>
    <div
      v-if="!editing && !(modalPage === 1)"
      class="section container footer"
    >
      <div class="footer-left">
        <div
          v-if="modalPage > 1"
          class="prev-outer"
          @click="prev()"
        >
          <div
            class="prev-arrow svg-icon"
            v-html="icons.arrowLeft"
          ></div>
          <div
            v-once
            class="prev"
          >
            {{ $t('prev') }}
          </div>
        </div>
      </div>
      <div class="footer-center text-center circles">
        <div
          class="circle"
          :class="{active: modalPage === 1}"
        ></div>
        <div
          class="circle"
          :class="{active: modalPage === 2}"
        ></div>
        <div
          class="circle"
          :class="{active: modalPage === 3}"
        ></div>
      </div>
      <div class="footer-right">
        <div
          v-if="modalPage < 3"
          class="next-outer"
          @click="next()"
        >
          <div
            v-once
            class="next"
          >
            {{ $t('next') }}
          </div>
          <div
            class="next-arrow svg-icon"
            v-html="icons.arrowRight"
          ></div>
        </div>
        <div
          v-if="modalPage === 3 && !loading"
          class="next-outer"
          :class="{disabled: taskCategories.length === 0}"
          @click="done()"
        >
          <div
            v-once
            class="next"
          >
            {{ $t('finish') }}
          </div>
          <div
            class="next-arrow svg-icon"
            v-html="icons.arrowRight"
          ></div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  $dialogMarginTop: 56px;
  $userCreationBgHeight:  105px;

  /* @TODO do not rely on avatar-modal___BV_modal_body_,
     it already changed once when bootstrap-vue reached version 1 */

  #avatar-modal___BV_modal_body_, #avatar-modal___BV_modal_body_ {
    padding: 0;
  }

  .page-2 {
    #avatar-modal___BV_modal_body_ {
      margin-top: $dialogMarginTop;
    }

    &#avatar-modal {
      .modal-dialog.modal-md {
        margin-top: 186px;
      }
    }
  }

  #avatar-modal {

    .first-page-footer {
      margin-bottom: 32px;
    }

    .customize-section {
      text-align: center;
      padding-bottom: 2em;
    }

    #creator-background {
      background-color: $purple-200;
    }

    .corner-decoration {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #ffbe5d;
      border: inherit;
      outline: inherit;
    }

    .small {
      color: $gray-200;
    }

    h3 {
      font-size: 20px;
      font-weight: normal;
      color: $gray-200;
    }

    .purchase-all {
      margin-bottom: 1em;
    }

    .edit-modal {
      margin-top: 10em;
    }

    .row.sub-menu + .row.sub-menu {
      margin-top: 0.5em;
    }

    .welcome-section {
      margin-top: 2.5em;
      margin-bottom: 2.5em;
    }

    .logo {
      width: 190px;
      margin: 0 auto 1.25em;
    }

    .user-creation-bg {
      background-image: url('~@/assets/creator/creator-hills-bg.png');
      height: $userCreationBgHeight;
      width: 219px;
      margin: 0 auto;
    }

    .avatar {
      position: absolute !important; // was overwritten in production build
      top: -22px;
      left: 4em;
    }

    .top {
      position: absolute;
      top: -($dialogMarginTop + $userCreationBgHeight - 16px);
      right: 50%;
      left: 50%;
    }

    .justin-outer-section:not(.top) {
      margin-bottom: 24px;
    }

    .avatar-section {
      margin-bottom: 30px;
    }

    .edit-avatar {
      left: 9.2em;
    }

    .justin-section {
      position: relative;
    }

    .justin-message {
      border-color: #ffa623;
      border-style: solid;
      border-width: 2px;
      outline-color: #b36213;
      outline-style: solid;
      outline-width: 2px;
      position: relative;
      padding: 2em;
      margin: 2px;
      height: 100%;
      width: 400px;
      background: $gray-700;

      p {
        margin: auto;
      }

      p + p {
        margin-top: 1em;
      }
    }

    .npc-justin-textbox {
      position: absolute;
      right: 1rem;
      top: -3.1rem;
      width: 48px;
      height: 48px;
    }

    .featured-label {
      position: absolute;
      top: -1rem;
      left: 1.5rem;
      border-radius: 2px;
      margin: auto;

      .text {
        font-size: 12px;
        min-height: auto;
        color: $white;
      }
    }

    .circles {
      align-self: flex-end;
    }

    .circle {
      width: 8px;
      height: 8px;
      background-color: #d8d8d8;
      border-radius: 50%;
      display: inline-block;
      margin-right: 1em;

      &:last-of-type {
        margin-right: 0;
      }
    }

    .circle.active {
      background-color: $purple-300;
    }

    .customize-menu {
      .menu-item .svg-icon {
        width: 32px;
        height: 32px;
        margin: 0 auto;
      }

      .menu-container {
        color: #a5a1ac;
      }

      .menu-container:hover, .menu-container.active {
        cursor: pointer;
        color: $purple-300;
      }

      .indicator {
        display: none;
      }

      .menu-container.active .indicator{
        width: 0px;
        height: 0px;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 12px solid $gray-700;
        display: block;
        margin: 0 auto;
      }
    }

    .text-center {
      .gem-lock, .gold-lock {
        display: inline-block;
        margin-right: 1em;
        margin-bottom: 1.6em;
        vertical-align: bottom;
      }
    }

    .gem-lock, .gold-lock {
      .svg-icon {
        width: 16px;
      }

      span {
        font-weight: bold;
        margin-left: .5em;
      }

      .svg-icon, span {
        display: inline-block;
        vertical-align: bottom;
      }
    }

    .gem-lock span {
      color: $green-10
    }

    .gold-lock span {
      color: $yellow-10
    }

    .customize-section {
      background-color: #f9f9f9;
      min-height: 280px;
    }

    .interests-section {
      margin-top: 3em;
      margin-bottom: 60px;

      .task-option {
        margin: 0 auto;
        width: 70%;
      }
    }

    #backgrounds {
      padding-top: 12px;

      .title-row {
        margin-bottom: 1em;
      }

      .backgroundFilterToggle {
        display: flex;
        flex: 1;
        justify-content: center;
      }

      .set-title {
        margin-top: 1em;
        margin-bottom: 1em;
      }

      .background {
        margin: 0 auto;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
        border-radius: 2px;
      }

      strong {
        margin: 0 auto;
      }

      .incentive-background {
        background-image: none;
        width: 68px;
        height: 68px;
        border-radius: 8px;
        background-color: #92b6bd;
        margin: 0 auto;
        padding-top: .3em;

        .small-rectangle {
          width: 60px;
          height: 40px;
          border-radius: 4px;
          margin: 0 auto;
          opacity: .6;
          background: white;
        }
      }

      .background_violet {
        background-color: #a993ed;
      }

      .background_blue {
        background-color: #92b6bd;
      }

      .background_green {
        background-color: #92bd94;
      }

      .background_purple {
        background-color: #9397bd;
      }

      .background_red {
        background-color: #b77e80;
      }

      .background_yellow {
        background-color: #bcbb91;
      }

      .incentive-background:hover {
        cursor: pointer;
      }

      .background:hover {
        cursor: pointer;
      }

      .purchase-background {
        margin: 0 auto;
        background: #fff;
        padding: 0.5em;
        border-radius: 0 0 2px 2px;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
        cursor: pointer;

        span {
          font-weight: bold;
          font-size: 12px;
        }

        span.price {
          color: #24cc8f;
        }

        .gem, .coin, .hourglass {
          width: 16px;
        }

        &.single {
          width: 141px;
        }

        &.set {
          width: 100%;

          span {
            font-size: 14px;
          }

          .gem, .coin {
            width: 20px;
          }
        }
      }

      .gem, .coin, .hourglass {
        margin: 0 .5em;
        display: inline-block;
        vertical-align: bottom;
      }

      .background-set {
        width: 100%;
        margin: 10px;
        background-color: #edecee;
        border-radius: 2px;
      }
    }

    .footer {
      margin-top: 24px;
      padding-bottom: 24px;
      padding-left: 24px;
      padding-right: 24px;
      bottom: 0;
      width: 100%;
      display: flex;

      * {
        transition: none !important;
      }

      .footer-left, .footer-right {
        flex: auto;
        flex-grow: 0;
        width: 30%
      }

      .footer-center {
        flex: 1;
      }

      .prev, .next {
        color: $gray-300;
        font-weight: bold;
        display: inline-block;
        padding: 0.4em;
      }

      .prev {
        padding-left: 16px;
      }

      .next {
        padding-right: 16px;
      }

      .prev-outer {
        white-space: nowrap;

        &:hover {
          cursor: pointer;

          .prev {
            color: $purple-300;
          }

          .prev-arrow {
            path {
              fill: $purple-300;
            }
          }
        }
      }

      .prev-arrow, .next-arrow {
        width: 32px;
        height: 32px;
        display: inline-block;
        vertical-align: bottom;
      }

      .next-outer {
        white-space: nowrap;
        flex: 1;
        text-align: right;

        &:hover {
          cursor: pointer;

          .next {
            color: $purple-300;
          }

          .next-arrow {
            path {
              fill: $purple-300;
            }
          }
        }
      }
    }

    .background-button {
      margin-bottom: 15px;

      .badge-pin:not(.pinned) {
        display: none;
      }

      &:hover .badge-pin {
        display: block;
      }
    }
  }
</style>

<script>
import axios from 'axios';
import map from 'lodash/map';
import { mapState } from '@/libs/store';
import avatar from './avatar';
import usernameForm from './settings/usernameForm';
import shops from '@/../../common/script/libs/shops';
import guide from '@/mixins/guide';
import notifications from '@/mixins/notifications';
import PinBadge from '@/components/ui/pinBadge';
import toggleSwitch from '@/components/ui/toggleSwitch';
import bodySettings from './avatarModal/body-settings';
import skinSettings from './avatarModal/skin-settings';
import hairSettings from './avatarModal/hair-settings';
import extraSettings from './avatarModal/extra-settings';
import subMenu from './avatarModal/sub-menu';

import logoPurple from '@/assets/svg/logo-purple.svg';
import bodyIcon from '@/assets/svg/body.svg';
import accessoriesIcon from '@/assets/svg/accessories.svg';
import skinIcon from '@/assets/svg/skin.svg';
import hairIcon from '@/assets/svg/hair.svg';
import backgroundsIcon from '@/assets/svg/backgrounds.svg';
import gem from '@/assets/svg/gem.svg';
import hourglass from '@/assets/svg/hourglass.svg';
import gold from '@/assets/svg/gold.svg';
import arrowRight from '@/assets/svg/arrow_right.svg';
import arrowLeft from '@/assets/svg/arrow_left.svg';
import svgClose from '@/assets/svg/close.svg';
import isPinned from '@/../../common/script/libs/isPinned';
import { avatarEditorUtilies } from '../mixins/avatarEditUtilities';

import content from '@/../../common/script/content/index';

export default {
  components: {
    avatar,
    bodySettings,
    extraSettings,
    hairSettings,
    PinBadge,
    skinSettings,
    subMenu,
    toggleSwitch,
    usernameForm,
  },
  mixins: [guide, notifications, avatarEditorUtilies],
  data () {
    const backgroundShopSets = shops.getBackgroundShopSets();

    return {
      loading: false,
      backgroundShopSets,
      backgroundUpdate: new Date(),
      filterBackgrounds: false,

      icons: Object.freeze({
        logoPurple,
        bodyIcon,
        accessoriesIcon,
        skinIcon,
        hairIcon,
        backgroundsIcon,
        gem,
        hourglass,
        gold,
        arrowRight,
        arrowLeft,
        close: svgClose,
      }),
      modalPage: 1,
      activeTopPage: 'body',
      activeSubPage: 'size',
      taskCategories: [],
      skinSubMenuItems: [
        {
          id: 'color',
          label: this.$t('color'),
        },
      ],

      bgSubMenuItems: ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014'].map(y => ({
        id: y,
        label: y,
      })),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      currentEvent: 'worldState.data.currentEvent',
    }),
    editing () {
      return this.$store.state.avatarEditorOptions.editingUser;
    },
    startingPage () {
      return this.$store.state.avatarEditorOptions.startingPage;
    },
    backgroundShopSetsByYear () {
      // @TODO: add dates to backgrounds
      const backgroundShopSetsByYear = {
        2014: [],
        2015: [],
        2016: [],
        2017: [],
        2018: [],
        2019: [],
        2020: [],
        2021: [],
        2022: [],
        2023: [],
      };

      // Hack to force update for now until we restructure the data
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      this.backgroundShopSets.forEach(set => {
        const year = set.identifier.substr(set.identifier.length - 4);
        if (!backgroundShopSetsByYear[year]) return;

        let setOwnedByUser = false;
        for (const key in set.items) {
          if (this.user.purchased.background[key]) setOwnedByUser = true;
        }
        set.userOwns = setOwnedByUser;

        backgroundShopSetsByYear[year].push(set);
      });
      return backgroundShopSetsByYear;
    },
    ownedBackgrounds () {
      const ownedBackgrounds = [];

      // Hack to force update for now until we restructure the data
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      this.backgroundShopSets.forEach(set => {
        set.items.forEach(bg => {
          if (this.user.purchased.background[bg.key]) {
            ownedBackgrounds.push(bg);
          }
        });
      });
      return ownedBackgrounds;
    },
    imageURL () {
      if (!this.currentEvent || !this.currentEvent.season) {
        return 'url(/static/npc/normal/npc_justin.png)';
      }
      return `url(/static/npc/${this.currentEvent.season}/npc_justin.png)`;
    },
  },
  watch: {
    editing () {
      if (this.editing) this.modalPage = 2;
    },
    startingPage () {
      if (!this.$store.state.avatarEditorOptions.startingPage) return;
      this.activeTopPage = this.$store.state.avatarEditorOptions.startingPage;
      this.activeSubPage = this.$store.state.avatarEditorOptions.subpage;
      this.$store.state.avatarEditorOptions.startingPage = '';
      this.$store.state.avatarEditorOptions.subpage = '';
    },
  },
  mounted () {
    if (this.editing) this.modalPage = 2;
    // Buy modal is global, so we listen at root. I'd like to not
    this.$root.$on('buyModal::boughtItem', this.backgroundPurchased);
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'avatar-modal');
    },
    purchase (type, key) {
      this.$store.dispatch('shops:purchase', {
        type,
        key,
      });
      this.backgroundUpdate = new Date();
    },
    prev () {
      this.modalPage -= 1;
    },
    next () {
      this.modalPage += 1;
    },
    changeTopPage (page, subpage) {
      this.activeTopPage = page;
      if (subpage) this.activeSubPage = subpage;
    },
    changeSubPage (page) {
      this.activeSubPage = page;
    },
    async done () {
      this.loading = true;

      let tasksToCreate = [
        ...content.tasksByCategory.defaults.map(t => ({
          ...t,
          text: t.text(),
          notes: t.notes && t.notes(),
        })),
      ];
      this.taskCategories.forEach(category => {
        tasksToCreate = tasksToCreate.concat(content.tasksByCategory[category].map(t => ({
          ...t,
          text: t.text(),
          notes: t.notes && t.notes(),
        })));
      });

      // @TODO: Move to the action
      const response = await axios.post('/api/v4/tasks/user', tasksToCreate);
      const tasks = response.data.data;
      tasks.forEach(task => {
        this.$store.state.user.data.tasksOrder[`${task.type}s`].unshift(task._id);
        this.$store.state.tasks.data[`${task.type}s`].unshift(task);
      });

      this.$root.$emit('bv::hide::modal', 'avatar-modal');
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }

      // NOTE: it's important this flag is set AFTER the onboarding default tasks
      // have been created or it'll break the onboarding guide achievement for creating a task
      this.$store.dispatch('user:set', {
        'flags.welcomed': true,
      });

      // @TODO: This is a timeout to ensure dom is loaded
      window.setTimeout(() => {
        this.initTour();
        this.goto('intro', 0);
      }, 1000);
    },
    showPlainBackgroundBlurb (identifier, set) {
      return identifier === 'incentiveBackgrounds' && !this.ownsSet('background', set);
    },
    ownsSet (type, set) {
      let setOwnedByUser = false;

      for (let key of Object.keys(set)) {
        const value = set[key];
        if (type === 'background') key = value.key;
        if (this.user.purchased[type][key]) setOwnedByUser = true;
      }

      return setOwnedByUser;
    },
    setKeys (type, _set) {
      return map(_set, (v, k) => {
        if (type === 'background') k = v.key; // eslint-disable-line no-param-reassign
        return `${type}.${k}`;
      }).join(',');
    },
    backgroundLockedStatus (bgKey) {
      let backgroundClass = 'background-locked';
      if (this.user.purchased.background[bgKey]) backgroundClass = 'background-unlocked';
      return backgroundClass;
    },
    isBackgroundPinned (bg) {
      return isPinned(this.user, bg);
    },
    togglePinned (bg) {
      if (!this.$store.dispatch('user:togglePinnedItem', { type: bg.pinType, path: bg.path })) {
        this.text(this.$t('unpinnedItem', { item: bg.text }));
      }
    },
    backgroundSelected (bg) {
      this.$root.$emit('buyModal::showItem', bg);
    },
    backgroundPurchased () {
      this.backgroundUpdate = new Date();
    },
  },
};
</script>

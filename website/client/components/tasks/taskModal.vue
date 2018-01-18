<template lang="pug">
  form(v-if="task", @submit.stop.prevent="submit()")
    b-modal#task-modal(size="sm", @hidden="onClose()")
      .task-modal-header(slot="modal-header", :class="cssClass('bg')")
        .clearfix
          h1.float-left {{ title }}
          .float-right.d-flex.align-items-center
            span.cancel-task-btn.mr-2(v-once, @click="cancel()") {{ $t('cancel') }}
            button.btn.btn-secondary(type="submit", v-once) {{ $t('save') }}
        .form-group
          label(v-once) {{ `${$t('text')}*` }}
          input.form-control.title-input(
            type="text",
            required, v-model="task.text",
            autofocus, spellcheck="true",
            :disabled="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
          )
        .form-group
          label.d-flex.align-items-center.justify-content-between(v-once)
            span {{ $t('notes') }}
            small(v-once)
              a(target="_blank", href="http://habitica.wikia.com/wiki/Markdown_Cheat_Sheet") {{ $t('markdownHelpLink') }}

          textarea.form-control(v-model="task.notes", rows="3")
      .task-modal-content
        .option.mt-0(v-if="task.type === 'reward'")
          .form-group
            label(v-once) {{ $t('cost') }}
            .input-group
              .input-group-prepend.input-group-icon
                .svg-icon.gold(v-html="icons.gold")
              input.form-control(type="number", v-model="task.value", required, placeholder="1.0", step="0.01", min="0")

        .option.mt-0(v-if="checklistEnabled")
          label(v-once) {{ $t('checklist') }}
          br
          draggable(
            v-model="checklist",
            :options="{handle: '.grippy', filter: '.task-dropdown'}",
            @update="sortedChecklist"
          )
            .inline-edit-input-group.checklist-group.input-group(v-for="(item, $index) in checklist")
              span.grippy
              input.inline-edit-input.checklist-item.form-control(type="text", v-model="item.text")
              span.input-group-append(@click="removeChecklistItem($index)")
                .svg-icon.destroy-icon(v-html="icons.destroy")
          input.inline-edit-input.checklist-item.form-control(type="text", :placeholder="$t('newChecklistItem')", @keydown.enter="addChecklistItem($event)", v-model="newChecklistItem")
        .d-flex.justify-content-center(v-if="task.type === 'habit'")
          .option-item.habit-control(@click="toggleUpDirection()", :class="task.up ? 'habit-control-enabled' : cssClass('habit-control-disabled')")
            .option-item-box(:class="task.up ? cssClass('bg') : ''")
              .task-control.habit-control
                .svg-icon.positive(v-html="icons.positive", :class="task.up ? cssClass('icon') : ''")
            .option-item-label(:class="task.up ? cssClass('text') : ''") {{ $t('positive') }}
          .option-item.habit-control(@click="toggleDownDirection()", :class="task.down ? 'habit-control-enabled' : cssClass('habit-control-disabled')")
            .option-item-box(:class="task.down ? cssClass('bg') : ''")
              .task-control.habit-control
                .svg-icon.negative(v-html="icons.negative", :class="task.down ? cssClass('icon') : ''")
            .option-item-label(:class="task.down ? cssClass('text') : ''") {{ $t('negative') }}
        template(v-if="task.type !== 'reward'")
          label(v-once)
            span.float-left {{ $t('difficulty') }}
            .svg-icon.info-icon(v-html="icons.information", v-b-tooltip.hover.righttop="$t('difficultyHelp')")
          .d-flex.justify-content-center.difficulty-options
            .option-item(:class="task.priority === 0.1 ? 'option-item-selected' : cssClass('option-disabled')", @click="setDifficulty(0.1)")
              .option-item-box(:class="task.priority === 0.1 ? cssClass('bg') : ''")
                .svg-icon.difficulty-trivial-icon(v-html="icons.difficultyTrivial")
              .option-item-label(:class="task.priority === 0.1 ? cssClass('text') : ''") {{ $t('trivial') }}
            .option-item(:class="task.priority === 1 ? 'option-item-selected' : cssClass('option-disabled')", @click="setDifficulty(1)")
              .option-item-box(:class="task.priority === 1 ? cssClass('bg') : ''")
                .svg-icon.difficulty-normal-icon(v-html="icons.difficultyNormal")
              .option-item-label(:class="task.priority === 1 ? cssClass('text') : ''") {{ $t('easy') }}
            .option-item(:class="task.priority === 1.5 ? 'option-item-selected' : cssClass('option-disabled')", @click="setDifficulty(1.5)")
              .option-item-box(:class="task.priority === 1.5 ? cssClass('bg') : ''")
                .svg-icon.difficulty-medium-icon(v-html="icons.difficultyMedium")
              .option-item-label(:class="task.priority === 1.5 ? cssClass('text') : ''") {{ $t('medium') }}
            .option-item(:class="task.priority === 2 ? 'option-item-selected' : cssClass('option-disabled')", @click="setDifficulty(2)")
              .option-item-box(:class="task.priority === 2 ? cssClass('bg') : ''")
                .svg-icon.difficulty-hard-icon(v-html="icons.difficultyHard")
              .option-item-label(:class="task.priority === 2 ? cssClass('text') : ''") {{ $t('hard') }}
        .option(v-if="task.type === 'todo'")
          .form-group
            label(v-once) {{ $t('dueDate') }}
            datepicker(
              v-model="task.date",
              :calendarIcon="icons.calendar",
              :clearButton='true',
              :clearButtonText='$t("clear")',
              :todayButton='!challengeAccessRequired',
              :todayButtonText='$t("today")',
              :disabled-picker='challengeAccessRequired'
            )
        .option(v-if="task.type === 'daily'")
          .form-group
            label(v-once) {{ $t('startDate') }}
            datepicker(
              v-model="task.startDate",
              :calendarIcon="icons.calendar",
              :clearButton="false",
              :todayButton="!challengeAccessRequired",
              :todayButtonText="$t('today')",
              :disabled-picker="challengeAccessRequired"
            )
        .option(v-if="task.type === 'daily'")
          .form-group
            label(v-once) {{ $t('repeats') }}
            b-dropdown.inline-dropdown(:text="$t(task.frequency)")
              b-dropdown-item(v-for="frequency in ['daily', 'weekly', 'monthly', 'yearly']",
              :key="frequency", @click="task.frequency = frequency",
              :disabled='challengeAccessRequired',
              :class="{active: task.frequency === frequency}")
                | {{ $t(frequency) }}
          .form-group
            label(v-once) {{ $t('repeatEvery') }}
            .input-group
              input.form-control(type="number", v-model="task.everyX", min="0", max="9999", required, :disabled='challengeAccessRequired')
              .input-group-append.input-group-text {{ repeatSuffix }}
          template(v-if="task.frequency === 'weekly'")
            .form-group
              label.d-block(v-once) {{ $t('repeatOn') }}
              .form-check-inline.weekday-check.mr-0(
                v-for="(day, dayNumber) in ['su','m','t','w','th','f','s']",
                :key="dayNumber",
              )
                .custom-control.custom-checkbox.custom-control-inline
                  input.custom-control-input(type="checkbox", v-model="task.repeat[day]", :disabled='challengeAccessRequired', :id="`weekday-${dayNumber}`")
                  label.custom-control-label(v-once, :for="`weekday-${dayNumber}`") {{ weekdaysMin(dayNumber) }}
          template(v-if="task.frequency === 'monthly'")
            label.d-block(v-once) {{ $t('repeatOn') }}
            .form-radio
              .custom-control.custom-radio.custom-control-inline
                input.custom-control-input(type='radio', v-model="repeatsOn", value="dayOfMonth", id="repeat-dayOfMonth")
                label.custom-control-label(for="repeat-dayOfMonth") {{ $t('dayOfMonth') }}
              .custom-control.custom-radio.custom-control-inline
                input.custom-control-input(type='radio', v-model="repeatsOn", value="dayOfWeek", id="repeat-dayOfWeek")
                label.custom-control-label(for="repeat-dayOfWeek") {{ $t('dayOfWeek') }}

        .tags-select.option(v-if="isUserTask")
          .tags-inline.form-group.row
            label.col-12(v-once) {{ $t('tags') }}
            .col-12
              .category-wrap(@click="toggleTagSelect()", v-bind:class="{ active: showTagsSelect }")
                span.category-select(v-if='task.tags && task.tags.length === 0')
                  .tags-none {{$t('none')}}
                  .dropdown-toggle
                span.category-select(v-else)
                  .category-label(v-for='tagName in truncatedSelectedTags', :title="tagName") {{ tagName }}
                  .tags-more(v-if='remainingSelectedTags.length > 0') +{{ $t('more', { count: remainingSelectedTags.length }) }}
                  .dropdown-toggle
          tags-popup(v-if="showTagsSelect", :tags="user.tags", v-model="task.tags", @close='closeTagsPopup()')

        .option(v-if="task.type === 'habit'")
          .form-group
            label(v-once) {{ $t('resetStreak') }}
            b-dropdown.inline-dropdown(:text="$t(task.frequency)", :disabled='challengeAccessRequired')
              b-dropdown-item(v-for="frequency in ['daily', 'weekly', 'monthly']", :key="frequency", @click="task.frequency = frequency", :class="{active: task.frequency === frequency}")
                | {{ $t(frequency) }}

        .option.group-options(v-if='groupId')
          .form-group.row
            label.col-12(v-once) {{ $t('assignedTo') }}
            .col-12
              .category-wrap(@click="showAssignedSelect = !showAssignedSelect")
                span.category-select(v-if='assignedMembers && assignedMembers.length === 0') {{$t('none')}}
                span.category-select(v-else)
                  span(v-for='memberId in assignedMembers') {{memberNamesById[memberId]}}
              .category-box(v-if="showAssignedSelect")
                .container
                  .row
                    .form-check.col-6(
                      v-for="member in members",
                      :key="member._id",
                    )
                      .custom-control.custom-checkbox
                        input.custom-control-input(type="checkbox", :value="member._id", v-model="assignedMembers", @change='toggleAssignment(member._id)', :id="`assigned-${member._id}`")
                        label.custom-control-label(v-once, :for="`assigned-${member._id}`") {{ member.profile.name }}

                  .row
                    button.btn.btn-primary(@click="showAssignedSelect = !showAssignedSelect") {{$t('close')}}

        .option.group-options(v-if='groupId')
          .form-group
            label(v-once) {{ $t('approvalRequired') }}
            toggle-switch.d-inline-block(
              label="",
              :checked="requiresApproval",
              @change="updateRequiresApproval"
            )

        .advanced-settings(v-if="task.type !== 'reward'")
          .advanced-settings-toggle.d-flex.justify-content-between.align-items-center(@click = "showAdvancedOptions = !showAdvancedOptions")
            h3 {{ $t('advancedSettings') }}
            .toggle-up
              .svg-icon(v-html="icons.down", :class="{'toggle-open': showAdvancedOptions}")
          b-collapse#advancedOptionsCollapse(v-model="showAdvancedOptions")
            .advanced-settings-body
              .option(v-if="task.type === 'daily' && isUserTask && purpose === 'edit'")
                .form-group
                  label(v-once) {{ $t('restoreStreak') }}
                  .input-group
                    .input-group-prepend.streak-addon.input-group-icon
                      .svg-icon(v-html="icons.streak")
                    input.form-control(type="number", v-model="task.streak", min="0", required)

              .option(v-if="task.type === 'habit' && isUserTask && purpose === 'edit' && (task.up || task.down)")
                .form-group
                  label(v-once) {{ $t('restoreStreak') }}
                  .row
                    .col-6(v-if="task.up")
                      .input-group
                        .input-group-prepend.positive-addon.input-group-icon
                          .svg-icon(v-html="icons.positive")
                        input.form-control(
                          type="number", v-model="task.counterUp", min="0", required,
                        )
                    .col-6(v-if="task.down")
                      .input-group
                        .input-group-prepend.negative-addon.input-group-icon
                          .svg-icon(v-html="icons.negative")
                        input.form-control(
                          type="number", v-model="task.counterDown", min="0", required,
                        )

              //.option(v-if="isUserTask && task.type !== 'reward'")
                .form-group
                  label(v-once)
                    span.float-left {{ $t('attributeAllocation') }}
                    .svg-icon.info-icon(v-html="icons.information", v-b-tooltip.hover.righttop.html="$t('attributeAllocationHelp')")
                  .attributes
                    .custom-control.custom-radio.custom-control-inline(v-for="attr in ATTRIBUTES", :key="attr")
                      input.custom-control-input(:id="`attribute-${attr}`", type="radio", :value="attr", v-model="task.attribute", :disabled="user.preferences.allocationMode !== 'taskbased'")
                      label.custom-control-label.attr-description(:for="`attribute-${attr}`", v-once, v-b-popover.hover="$t(`${attr}Text`)") {{ $t(attributesStrings[attr]) }}
        .delete-task-btn.d-flex.justify-content-center.align-items-middle(@click="destroy()", v-if="purpose !== 'create' && !challengeAccessRequired")
          .svg-icon.d-inline-b(v-html="icons.destroy")
          span {{ $t('deleteTask') }}

      .task-modal-footer.d-flex.justify-content-center.align-items-center(slot="modal-footer")
        .cancel-task-btn(v-once, @click="cancel()") {{ $t('cancel') }}
        button.btn.btn-primary(type="submit", v-once) {{ $t('save') }}
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  #task-modal {
    .modal-dialog.modal-sm {
      max-width: 448px;
    }

    label {
      font-weight: bold;
    }

    input, textarea {
      border: none;
      background: rgba(0, 0, 0, 0.24);
      color: rgba($white, 0.64) !important;
      transition-property: border-color, box-shadow, color, background;

      &:focus, &:active {
        color: $white !important;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.32);
      }

      &:focus, &:active, &:hover {
        background-color: rgba(0, 0, 0, 0.40);
      }
    }

    .modal-content {
      border-radius: 8px;
      border: none;
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .task-modal-content, .task-modal-header {
      padding-left: 23px;
      padding-right: 23px;
    }

    .task-modal-header {
      color: $white;
      width: 100%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding-top: 16px;
      padding-bottom: 24px;

      h1 {
        color: $white;
      }
    }

    .task-modal-content {
      padding-top: 24px;

      input {
        background: $white;
        border: 1px solid $gray-400;
        color: $gray-200 !important;

        &:focus {
          color: $gray-50 !important;
        }
      }
    }

    .info-icon {
      float: left;
      height: 16px;
      width: 16px;
      margin-left: 8px;
      margin-top: 2px;
    }

    .difficulty-trivial-icon {
      width: 16px;
      height: 16px;
      color: $gray-300;
    }

    .difficulty-normal-icon {
      width: 36px;
      height: 16px;
      color: $gray-300;
    }

    .difficulty-medium-icon {
      width: 36px;
      height: 32px;
      color: $gray-300;
    }

    .difficulty-hard-icon {
      width: 36px;
      height: 36px;
      color: $gray-300;
    }

    .option {
      margin-bottom: 12px;
      margin-top: 12px;
      position: relative;

      label {
        margin-bottom: 8px;
      }
    }

    .difficulty-options .option-item-selected .svg-icon {
      color: $white !important;
    }

    .option-item {
      margin-right: 48px;
      cursor: pointer;

      &:last-child {
        margin-right: 0px;
      }

      &-box {
        width: 64px;
        height: 64px;
        border-radius: 2px;
        background: $gray-600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &-label {
        color: $gray-50;
        text-align: center;
        transition-property: none;
      }
    }

    .habit-control {
      .option-item-box {
        background: $white;
        border: 2px solid $gray-600;

        .habit-control { background: $gray-300; }
        .svg-icon { color: $white; }
      }

      &-enabled {
        .option-item-box {
          border: 2px solid transparent;
          transition-property: none;

          .habit-control { background: $white !important; }
        }
      }
    }

    .category-wrap {
      cursor: pointer;
      margin-top: 0px;
      width: 100%;
    }

    .category-box {
      bottom: 0px;
      left: 40px;
      top: auto;
      z-index: 11;

      .container {
        max-height: 90vh;
        overflow: auto;
      }
    }

    .tags-select {
      position: relative;

      .tags-inline {
        .category-wrap {
          cursor: inherit;
          position: relative;
          border: 1px solid transparent;
          border-radius: 2px;
          display: inline-block;

          &.active {
            border-color: $purple-500;

            .category-select {
              box-shadow: none;
            }
          }

          .category-select {
            align-items: center;
            display: flex;
            padding: .6em;
            padding-right: 2.8em;
            width: 100%;

            .tags-none {
              margin: .26em 0 .26em .6em;

              & + .dropdown-toggle {
                right: 1.3em;
              }
            }

            .tags-more {
              color: $gray-300;
              flex: 0 1 auto;
              font-size: 12px;
              text-align: left;
              position: relative;
              left: .5em;
              width: 100%;
            }

            .dropdown-toggle {
              position: absolute;
              right: 1em;
              top: .8em;
            }

            .category-label {
              min-width: 68px;
              overflow: hidden;
              padding: .5em 1em;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 68px;
              word-wrap: break-word;
            }
          }
        }
      }

      .tags-popup {
        position: absolute;
        top: 100%;
      }
    }

    .checklist-group {
      border-top: 1px solid $gray-500;

      .input-group-append {
        background: inherit;
      }

      .checklist-item {
        padding-left: 12px;
      }
    }

    // From: https://codepen.io/zachariab/pen/wkrbc
    span.grippy {
      content: '....';
      width: 20px;
      height: 20px;
      display: inline-block;
      overflow: hidden;
      line-height: 5px;
      padding: 3px 4px;
      cursor: move;
      vertical-align: middle;
      margin-top: .5em;
      margin-right: .3em;
      font-size: 12px;
      letter-spacing: 2px;
      color: $gray-300;
      text-shadow: 1px 0 1px black;
    }

    span.grippy::after {
      content: '.. .. .. ..';
    }

    .checklist-item {
      margin-bottom: 0px;
      border-radius: 0px;
      border: none !important;
      padding-left: 36px;

      &:last-child {
        background-repeat: no-repeat;
        background-position: center left 10px;
        border-top: 1px solid $gray-500 !important;
        border-bottom: 1px solid $gray-500 !important;
        background-size: 10px 10px;
        background-image: url(~client/assets/svg/for-css/positive.svg);
      }
    }

    .checklist-group {
      .destroy-icon {
        display: none;
      }

      &:hover {
        cursor: text;
        .destroy-icon {
          display: inline-block;
          color: $gray-200;
        }
      }
    }

    .delete-task-btn, .cancel-task-btn {
      cursor: pointer;

      &:hover, &:focus, &:active {
        text-decoration: underline;
      }
    }

    .delete-task-btn {
      margin-top: 32px;
      margin-bottom: 8px;
      color: $red-50;

      .svg-icon {
        width: 14px;
        height: 16px;
        margin-right: 8.5px;
      }
    }

    .task-modal-footer {
      padding: 16px 24px;
      width: 100%;

      .cancel-task-btn {
        margin-right: 16px;
        color: $blue-10;
      }
    }

    .weekday-check {
      margin-left: 0px;
      width: 57px;
    }

    .advanced-settings {
      background: $gray-700;
      margin-left: -23px;
      margin-right: -23px;
      padding: 16px 24px;
      margin-bottom: -8px;

      &-toggle {
        cursor: pointer;
      }

      &-body {
        margin-top: 17px;
      }

      h3 {
        color: $gray-10;
        margin-bottom: 0px;
      }

      .attributes .custom-control {
        margin-right: 40px;
      }

      .toggle-open {
        transform: rotate(180deg);
      }

      .attr-description {
        border-bottom: 1px dashed;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .option-item {
      margin-right: 12px !important;
    }
  }
</style>

<style lang="scss" scoped>
  .gold {
    width: 24px;
    margin: 0 7px;
  }
</style>

<script>
import TagsPopup from './tagsPopup';
import { mapGetters, mapActions, mapState } from 'client/libs/store';
import toggleSwitch from 'client/components/ui/toggleSwitch';
import clone from 'lodash/clone';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import uuid from 'uuid';
import draggable from 'vuedraggable';

import informationIcon from 'assets/svg/information.svg';
import difficultyTrivialIcon from 'assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from 'assets/svg/difficulty-medium.svg';
import difficultyHardIcon from 'assets/svg/difficulty-hard.svg';
import difficultyNormalIcon from 'assets/svg/difficulty-normal.svg';
import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import streakIcon from 'assets/svg/streak.svg';
import deleteIcon from 'assets/svg/delete.svg';
import goldIcon from 'assets/svg/gold.svg';
import downIcon from 'assets/svg/down.svg';
import calendarIcon from 'assets/svg/calendar.svg';

export default {
  components: {
    TagsPopup,
    Datepicker,
    toggleSwitch,
    draggable,
  },
  // purpose is either create or edit, task is the task created or edited
  props: ['task', 'purpose', 'challengeId', 'groupId'],
  data () {
    return {
      maxTags: 3,
      showTagsSelect: false,
      showAssignedSelect: false,
      newChecklistItem: null,
      icons: Object.freeze({
        information: informationIcon,
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
        negative: negativeIcon,
        positive: positiveIcon,
        destroy: deleteIcon,
        gold: goldIcon,
        down: downIcon,
        streak: streakIcon,
        calendar: calendarIcon,
      }),
      requiresApproval: false, // We can't set task.group fields so we use this field to toggle
      members: [],
      memberNamesById: {},
      assignedMembers: [],
      checklist: [],
      showAdvancedOptions: false,
      attributesStrings: {
        str: 'strength',
        int: 'intelligence',
        con: 'constitution',
        per: 'perception',
      },
    };
  },
  watch: {
    async task () {
      if (this.groupId && this.task.group && this.task.group.approval && this.task.group.approval.required) {
        this.requiresApproval = true;
      }

      if (this.groupId) {
        let members = await this.$store.dispatch('members:getGroupMembers', {
          groupId: this.groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
        this.members.forEach(member => {
          this.memberNamesById[member._id] = member.profile.name;
        });
        this.assignedMembers = [];
        if (this.task.group && this.task.group.assignedUsers) this.assignedMembers = this.task.group.assignedUsers;
      }

      // @TODO: This whole component is mutating a prop and that causes issues. We need to not copy the prop similar to group modals
      if (this.task) this.checklist = clone(this.task.checklist);
    },
  },
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
      getTagsFor: 'tasks:getTagsFor',
      canDeleteTask: 'tasks:canDelete',
    }),
    ...mapState({
      user: 'user.data',
      dayMapping: 'constants.DAY_MAPPING',
      ATTRIBUTES: 'constants.ATTRIBUTES',
    }),
    groupAccessRequiredAndOnPersonalPage () {
      if (!this.groupId && this.task.group && this.task.group.id) return true;
      return false;
    },
    checklistEnabled () {
      return ['daily', 'todo'].indexOf(this.task.type) > -1 && !this.isOriginalChallengeTask;
    },
    isChallengeTask () {
      return Boolean(this.task.challenge && this.task.challenge.id);
    },
    onUserPage () {
      return !this.challengeId && !this.groupId;
    },
    challengeAccessRequired () {
      return this.onUserPage && this.isChallengeTask;
    },
    isOriginalChallengeTask () {
      let isUserChallenge = Boolean(this.task.userId);
      return !isUserChallenge && (this.challengeId || this.task.challenge && this.task.challenge.id);
    },
    canDelete () {
      return this.purpose !== 'create' && this.canDeleteTask(this.task);
    },
    title () {
      const type = this.$t(this.task.type);
      return this.$t(this.purpose === 'edit' ? 'editATask' : 'createTask', {type});
    },
    isUserTask () {
      return !this.challengeId && !this.groupId;
    },
    repeatSuffix () {
      const task = this.task;

      if (task.frequency === 'daily') {
        return task.everyX === 1 ? this.$t('day') : this.$t('days');
      } else if (task.frequency === 'weekly') {
        return task.everyX === 1 ? this.$t('week') : this.$t('weeks');
      } else if (task.frequency === 'monthly') {
        return task.everyX === 1 ? this.$t('month') : this.$t('months');
      } else if (task.frequency === 'yearly') {
        return task.everyX === 1 ? this.$t('year') : this.$t('years');
      }
    },
    repeatsOn: {
      get () {
        let repeatsOn = 'dayOfMonth';

        if (this.task.type === 'daily' && this.task.weeksOfMonth && this.task.weeksOfMonth.length > 0) {
          repeatsOn = 'dayOfWeek';
        }

        return repeatsOn;
      },
      set (newValue) {
        const task = this.task;

        if (task.frequency === 'monthly' && newValue === 'dayOfMonth') {
          const date = moment(task.startDate).date();
          task.weeksOfMonth = [];
          task.daysOfMonth = [date];
        } else if (task.frequency === 'monthly' && newValue === 'dayOfWeek') {
          const week = Math.ceil(moment(task.startDate).date() / 7) - 1;
          const dayOfWeek = moment(task.startDate).day();
          const shortDay = this.dayMapping[dayOfWeek];
          task.daysOfMonth = [];
          task.weeksOfMonth = [week];
          for (let key in task.repeat) {
            task.repeat[key] = false;
          }
          task.repeat[shortDay] = true;
        }
      },
    },
    selectedTags () {
      return this.getTagsFor(this.task);
    },
    truncatedSelectedTags () {
      return this.selectedTags.slice(0, this.maxTags);
    },
    remainingSelectedTags () {
      return this.selectedTags.slice(this.maxTags);
    },
  },
  methods: {
    ...mapActions({saveTask: 'tasks:save', destroyTask: 'tasks:destroy', createTask: 'tasks:create'}),
    cssClass (suffix) {
      return this.getTaskClasses(this.task, `${this.purpose === 'edit' ? 'edit' : 'create'}-modal-${suffix}`);
    },
    closeTagsPopup () {
      this.showTagsSelect = false;
    },
    setDifficulty (level) {
      if (this.challengeAccessRequired) return;
      this.task.priority = level;
    },
    toggleUpDirection () {
      if (this.challengeAccessRequired) return;
      this.task.up = !this.task.up;
    },
    toggleDownDirection () {
      if (this.challengeAccessRequired) return;
      this.task.down = !this.task.down;
    },
    toggleTagSelect () {
      this.showTagsSelect = !this.showTagsSelect;
    },
    sortedChecklist (data) {
      let sorting = clone(this.task.checklist);
      let movingItem = sorting[data.oldIndex];
      sorting.splice(data.oldIndex, 1);
      sorting.splice(data.newIndex, 0, movingItem);
      this.task.checklist = sorting;
    },
    addChecklistItem (e) {
      let checkListItem = {
        id: uuid.v4(),
        text: this.newChecklistItem,
        completed: false,
      };
      this.task.checklist.push(checkListItem);
      // @TODO: managing checklist separately to help with sorting on the UI
      this.checklist.push(checkListItem);
      this.newChecklistItem = null;
      if (e) e.preventDefault();
    },
    removeChecklistItem (i) {
      this.task.checklist.splice(i, 1);
      this.checklist = clone(this.task.checklist);
    },
    weekdaysMin (dayNumber) {
      return moment.weekdaysMin(dayNumber);
    },
    async submit () {
      if (this.newChecklistItem) this.addChecklistItem();

      if (this.purpose === 'create') {
        if (this.challengeId) {
          this.$store.dispatch('tasks:createChallengeTasks', {
            challengeId: this.challengeId,
            tasks: [this.task],
          });
          this.$emit('taskCreated', this.task);
        } else if (this.groupId) {
          await this.$store.dispatch('tasks:createGroupTasks', {
            groupId: this.groupId,
            tasks: [this.task],
          });

          let promises = this.assignedMembers.map(memberId => {
            return this.$store.dispatch('tasks:assignTask', {
              taskId: this.task._id,
              userId: memberId,
            });
          });
          Promise.all(promises);

          this.task.group.assignedUsers = this.assignedMembers;

          this.$emit('taskCreated', this.task);
        } else {
          this.createTask(this.task);
        }
      } else {
        if (this.groupId) {
          this.task.group.assignedUsers = this.assignedMembers;
          this.task.requiresApproval = this.requiresApproval;
        }

        this.saveTask(this.task);
        this.$emit('taskEdited', this.task);
      }
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    destroy () {
      if (!confirm(this.$t('sureDelete'))) return;
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    cancel () {
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    onClose () {
      this.showTagsSelect = false;
      this.newChecklistItem = '';
      this.$emit('cancel');
    },
    updateRequiresApproval (newValue) {
      let truthy = true;
      if (!newValue) truthy = false; // This return undefined instad of false
      this.requiresApproval = truthy;
    },
    async toggleAssignment (memberId) {
      let assignedIndex = this.assignedMembers.indexOf(memberId);

      if (assignedIndex  === -1) {
        if (this.purpose === 'create') {
          return;
        }

        await this.$store.dispatch('tasks:unassignTask', {
          taskId: this.task._id,
          userId: memberId,
        });
        return;
      }

      if (this.purpose === 'create') {
        return;
      }

      await this.$store.dispatch('tasks:assignTask', {
        taskId: this.task._id,
        userId: memberId,
      });
    },
  },
};
</script>

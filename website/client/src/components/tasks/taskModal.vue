<template>
  <b-modal
    id="task-modal"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    size="sm"
    :hide-footer="true"
    @hidden="onClose()"
    @show="syncTask()"
    @shown="focusInput()"
  >
    <div
      v-if="task"
      slot="modal-header"
      class="task-modal-header p-4"
      :class="cssClass('bg')"
    >
      <div class="d-flex align-items-center mb-3">
        <h2
          class="my-auto"
          :class="cssClass('headings')"
        >
          {{ title }}
        </h2>
        <div
          class="ml-auto d-flex align-items-center"
        >
          <button
            class="cancel-task-btn mr-3"
            :class="cssClass('headings')"
            type="button"
            @click="cancel()"
          >
            {{ $t('cancel') }}
          </button>
          <button
            class="btn btn-secondary d-flex align-items-center justify-content-center"
            :class="{disabled: !canSave}"
            type="button"
            @click="submit()"
          >
            <div
              v-if="purpose === 'edit'"
              class="m-auto"
            >
              {{ $t('save') }}
            </div>
            <div
              v-if="purpose === 'create'"
              class="m-auto"
            >
              {{ $t('create') }}
            </div>
          </button>
        </div>
      </div>
      <div class="form-group">
        <lockable-label
          :class-override="cssClass('headings')"
          :locked="challengeAccessRequired"
          :text="`${$t('text')}*`"
        />
        <input
          ref="inputToFocus"
          v-model="task.text"
          class="form-control input-title"
          :class="cssClass('input')"
          type="text"
          required="required"
          spellcheck="true"
          :disabled="challengeAccessRequired"
          :placeholder="$t('addATitle')"
        >
      </div>
      <div
        class="form-group mb-0"
      >
        <div class="d-flex">
          <lockable-label
            class="mr-auto"
            :class-override="cssClass('headings')"
            :text="`${$t('notes')}`"
          />
          <small
            class="my-1"
          >
            <a
              target="_blank"
              href="https://habitica.fandom.com/wiki/Markdown_Cheat_Sheet"
              :class="cssClass('headings')"
            >{{ $t('markdownHelpLink') }}</a>
          </small>
        </div>
        <textarea
          v-model="task.notes"
          class="form-control input-notes"
          :class="cssClass('input')"
          :placeholder="$t('addNotes')"
        ></textarea>
      </div>
    </div>
    <div
      v-if="task"
      class="task-modal-content px-4"
      :class="cssClass('content')"
    >
      <form
        @submit.stop.prevent="submit()"
      >
        <div
          v-if="task.type === 'reward'"
          class="option mt-3"
        >
          <div class="form-group">
            <label
              v-once
              class="mb-1"
            >{{ $t('cost') }}</label>
            <div class="input-group">
              <div class="input-group-prepend input-group-icon align-items-center">
                <div
                  class="svg-icon gold"
                  v-html="icons.gold"
                ></div>
              </div>
              <input
                v-model="task.value"
                class="form-control"
                type="number"
                required="required"
                placeholder="Enter a Value"
                step="0.01"
                min="0"
              >
            </div>
          </div>
        </div>
        <div
          v-if="checklistEnabled"
          class="option mt-3"
        >
          <checklist
            :items.sync="task.checklist"
          />
        </div>
        <div
          v-if="task.type === 'habit'"
          class="d-flex justify-content-center mt-3"
        >
          <button
            type="button"
            class="habit-option-container no-transition
              d-flex flex-column justify-content-center align-items-center"
            :class="!task.up ? cssClass('habit-control-disabled') : ''"
            :disabled="challengeAccessRequired"
            @click="toggleUpDirection()"
          >
            <div
              class="habit-option-button no-transition
                d-flex justify-content-center align-items-center mb-2"
              :class="task.up ? cssClass('bg') : ''"
            >
              <div
                class="habit-option-icon svg-icon no-transition"
                :class="task.up ? '' : 'disabled'"
                v-html="icons.positive"
              ></div>
            </div>
            <div
              class="habit-option-label no-transition"
              :class="task.up ? cssClass('icon') : 'disabled'"
            >
              {{ $t('positive') }}
            </div>
          </button>
          <button
            type="button"
            class="habit-option-container no-transition
              d-flex flex-column justify-content-center align-items-center"
            :class="!task.down ? cssClass('habit-control-disabled') : ''"
            :disabled="challengeAccessRequired"
            @click="toggleDownDirection()"
          >
            <div
              class="habit-option-button no-transition
                d-flex justify-content-center align-items-center mb-2"
              :class="task.down ? cssClass('bg') : ''"
            >
              <div
                class="habit-option-icon no-transition svg-icon negative mx-auto"
                :class="task.down ? '' : 'disabled'"
                v-html="icons.negative"
              ></div>
            </div>
            <div
              class="habit-option-label no-transition"
              :class="task.down ? cssClass('icon') : 'disabled'"
            >
              {{ $t('negative') }}
            </div>
          </button>
        </div>
        <template
          v-if="task.type !== 'reward'"
        >
          <div class="d-flex mt-3">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('difficulty')"
            />
            <div
              v-b-tooltip.hover.righttop="$t('difficultyHelp')"
              class="svg-icon info-icon mb-auto ml-1"
              v-html="icons.information"
            ></div>
          </div>
          <select-difficulty
            :value="task.priority"
            :disabled="challengeAccessRequired"
            @select="setDifficulty($event)"
          />
        </template>
        <div
          v-if="task.type === 'todo' && (!challengeAccessRequired || task.date)"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('dueDate')"
            />
            <datepicker
              :date.sync="task.date"
              :disabled="challengeAccessRequired"
              :highlighted="calendarHighlights"
              :clear-button="true"
            />
          </div>
        </div>
        <div
          v-if="task.type === 'daily'"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('startDate')"
            />
            <datepicker
              :date.sync="task.startDate"
              :disabled="challengeAccessRequired"
              :highlighted="calendarHighlights"
            />
          </div>
        </div>
        <div
          v-if="task.type === 'daily'"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('repeats')"
            />
            <select-translated-array
              :disabled="challengeAccessRequired"
              :items="['daily', 'weekly', 'monthly', 'yearly']"
              :value="task.frequency"
              @select="task.frequency = $event"
            />
          </div>
        </div>
        <div
          v-if="task.type === 'daily'"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('repeatEvery')"
            />
            <div
              class="input-group-outer"
              :class="{disabled: challengeAccessRequired}"
            >
              <div class="input-group">
                <input
                  v-model="task.everyX"
                  class="form-control"
                  type="number"
                  min="0"
                  max="9999"
                  required="required"
                  :disabled="challengeAccessRequired"
                >
              </div>
              <div class="input-group-spaced input-group-text">
                {{ repeatSuffix }}
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="task.type === 'daily' && task.frequency === 'weekly'"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('repeatOn')"
            />
            <div class="toggle-group">
              <toggle-checkbox
                v-for="(day, dayNumber) in ['su','m','t','w','th','f','s']"
                :key="dayNumber"
                :tab-index="dayNumber"
                :checked.sync="task.repeat[day]"
                :disabled="challengeAccessRequired"
                :text="weekdaysMin(dayNumber)"
              />
            </div>
          </div>
        </div>
        <div
          v-if="task.type === 'daily' && task.frequency === 'monthly'"
          class="option mt-3"
        >
          <label
            v-once
            class="d-block mb-1"
          >{{ $t('repeatOn') }}</label>
          <div class="form-radio">
            <div class="custom-control custom-radio custom-control-inline">
              <input
                id="repeat-dayOfMonth"
                v-model="repeatsOn"
                class="custom-control-input"
                type="radio"
                value="dayOfMonth"
                name="repeatsOn"
              >
              <label
                class="custom-control-label"
                for="repeat-dayOfMonth"
              >{{ $t('dayOfMonth') }}</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline">
              <input
                id="repeat-dayOfWeek"
                v-model="repeatsOn"
                class="custom-control-input"
                type="radio"
                value="dayOfWeek"
                name="repeatsOn"
              >
              <label
                class="custom-control-label"
                for="repeat-dayOfWeek"
              >{{ $t('dayOfWeek') }}</label>
            </div>
          </div>
        </div>
        <div
          v-if="!groupId"
          class="tags-select option mt-3"
        >
          <div class="tags-inline form-group row">
            <label
              v-once
              class="col-12 mb-1"
            >{{ $t('tags') }}</label>
            <div class="col-12">
              <select-multi
                ref="selectTag"
                :selected-items="task.tags"
                :all-items="user.tags"
                :add-new="true"
                :empty-message="$t('addTags')"
                :search-placeholder="$t('enterTag')"
                @changed="task.tags = $event"
                @addNew="addTag"
              />
            </div>
          </div>
        </div>
        <div
          v-if="task.type === 'habit' && !groupId"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired"
              :text="$t('resetCounter')"
            />
            <select-translated-array
              :disabled="challengeAccessRequired"
              :items="['daily', 'weekly', 'monthly']"
              :value="task.frequency"
              @select="task.frequency = $event"
            />
          </div>
        </div>
        <div
          v-if="groupId"
          class="option group-options mt-3"
        >
          <div class="form-group row mt-3 mb-3">
            <label
              v-once
              class="col-10 mb-1"
            >{{ $t('assignTo') }}</label>
            <a
              v-if="assignedMembers.length > 0"
              class="col-2 text-right mt-1"
              @click="clearAssignments"
            >
              {{ $t('clear') }}
            </a>
            <div class="col-12">
              <select-multi
                ref="assignMembers"
                :all-items="membersNameAndId"
                :empty-message="$t('unassigned')"
                :pill-invert="true"
                :search-placeholder="$t('chooseTeamMember')"
                :selected-items="assignedMembers"
                @toggle="toggleAssignment($event)"
              />
            </div>
          </div>
        </div>
        <div
          v-if="advancedSettingsAvailable"
          class="advanced-settings mt-3"
        >
          <div
            class="advanced-settings-toggle d-flex justify-content-between align-items-center"
            @click="showAdvancedOptions = !showAdvancedOptions"
          >
            <h3>{{ $t('advancedSettings') }}</h3>
            <div class="toggle-up">
              <div
                class="svg-icon"
                :class="{'toggle-open': showAdvancedOptions}"
                v-html="icons.chevron"
              ></div>
            </div>
          </div>
          <b-collapse
            id="advancedOptionsCollapse"
            v-model="showAdvancedOptions"
          >
            <div>
              <div
                v-if="task.type === 'daily' && isUserTask && purpose === 'edit'"
                class="option mt-3"
              >
                <div class="form-group">
                  <label
                    v-once
                    class="mb-1"
                  >{{ $t('restoreStreak') }}</label>
                  <div class="input-group">
                    <div class="input-group-prepend streak-addon input-group-icon">
                      <div
                        v-once
                        class="svg-icon"
                        v-html="icons.streak"
                      ></div>
                    </div>
                    <input
                      v-model="task.streak"
                      class="form-control"
                      type="number"
                      min="0"
                      required="required"
                    >
                  </div>
                </div>
              </div>
              <div
                v-if="task.type === 'habit'
                  && isUserTask && purpose === 'edit' && (task.up || task.down)"
                class="option mt-3"
              >
                <div class="form-group">
                  <label
                    v-once
                    class="mb-1"
                  >{{ $t('adjustCounter') }}</label>
                  <div
                    class="row streak-inputs"
                    :class="{'both': task.up && task.down}"
                  >
                    <div
                      v-if="task.up"
                      class="positive"
                      :class="{'col-6': task.down, 'col-12': !task.down}"
                    >
                      <div class="input-group">
                        <div class="input-group-prepend positive-addon input-group-icon">
                          <div
                            v-once
                            class="svg-icon"
                            v-html="icons.positive"
                          ></div>
                        </div>
                        <input
                          v-model="task.counterUp"
                          class="form-control"
                          type="number"
                          min="0"
                          required="required"
                        >
                      </div>
                    </div>
                    <div
                      v-if="task.down"
                      class="negative"
                      :class="{'col-6': task.up, 'col-12': !task.up}"
                    >
                      <div class="input-group">
                        <div class="input-group-prepend negative-addon input-group-icon">
                          <div
                            v-once
                            class="svg-icon"
                            v-html="icons.negative"
                          ></div>
                        </div>
                        <input
                          v-model="task.counterDown"
                          class="form-control"
                          type="number"
                          min="0"
                          required="required"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
        <div
          v-if="purpose !== 'create' && !challengeAccessRequired"
          class="d-flex justify-content-center mt-4 mb-4"
        >
          <button
            class="delete-task-btn d-flex"
            type="button"
            @click="destroy()"
          >
            <div
              v-once
              class="svg-icon"
              v-html="icons.destroy"
            ></div>
            <span class="delete-text mt-1">
              {{ $t('deleteTaskType', { type: $t(task.type) }) }}
            </span>
          </button>
        </div>
        <div
          v-if="purpose === 'create'"
          slot="modal-footer"
          class="task-modal-footer d-flex justify-content-center align-items-center mt-4 mb-4"
        >
          <button
            class="btn btn-primary btn-footer
            d-flex align-items-center justify-content-center"
            :class="{disabled: !canSave}"
            type="button"
            @click="submit()"
          >
            {{ $t('create') }}
          </button>
        </div>
        <div
          v-else
          class="task-modal-footer mt-4"
        >
        </div>
      </form>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #task-modal {
    a:not(.dropdown-item) {
      font-size: 12px;
      line-height: 1.33;
    }

    .modal-dialog.modal-sm {
      max-width: 448px;
    }

    .form-group {
      margin-bottom: 0;
    }

    .custom-control-input {
      z-index: -1;
      opacity: 0;
    }

    .modal-header {
      .form-group {
        margin-bottom: 1rem;
      }
    }

    .habit-option-container {
      &, &:focus, &:active, &:hover {
        outline: 0;
        border: 0;
        background: none;
      }
    }

    .no-transition {
      transition: none;
    }

    input, textarea {
      transition-property: border-color, box-shadow, color, background;
      background-color: rgba(255, 255, 255, 0.5);
      &:focus:not(:disabled), &:active:not(:disabled), &:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.75);
      }
    }

    .modal-content {
      border-radius: 8px;
      border: none;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .cursor-auto {
      cursor: auto;
    }

    .task-modal-header {
      color: $white;
      width: 100%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;

      h2 {
        color: $white;
      }
    }

    .info-icon {
      float: left;
      height: 16px;
      width: 16px;
      margin-top: 2px;
      color: $gray-200;
    }

    .option {
      position: relative;

      .custom-control-label p {
        word-break: break-word;
      }
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

    .datetime-buttons {
      display: flex;
      flex-direction: row;

      .btn {
        flex: 1;
      }
    }

    .delete-task-btn, .cancel-task-btn {
      border: 0;
      background: none;
      padding-right: 0;
      color: inherit;
      cursor: pointer;

      &:hover, &:active, &:focus {
        border: none !important;
        background: none !important;
        outline: none !important;

        text-decoration: underline;
      }
    }

    .delete-task-btn {
      height: 1.5rem;
      align-items: center;

      &:hover, &:focus, &:active {
        text-decoration: underline;
        text-decoration-color: $maroon-50;
      }

      .delete-text {
        font-size: 14px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.71;
        letter-spacing: normal;
        color: $maroon-50;
        height: 1.5rem;
      }

      .svg-icon {
        svg {
          height: 1rem;
          width: 1rem;
          object-fit: contain;
          display: inline;
        }

        margin-right: 0.5rem;
        color: $maroon-50;
        display: inline;
      }
    }

    .task-modal-footer {
      margin: 0;
      width: 100%;

      .cancel-task-btn {
        margin-right: 16px;
        color: $blue-10;
      }

      .btn-footer {
        height: 2rem;
      }
    }

    .weekday-check {
      margin-left: 0px;
      width: 57px;
    }

    .advanced-settings {
      min-height: 3rem;
      background-color: $gray-700;
      margin-left: -1.5rem;
      margin-right: -1.5rem;

      padding: 0.75rem 1.5rem;

      .form-group:last-of-type {
        margin-bottom: 0.75rem;
      }

      &-toggle {
        cursor: pointer;
      }

      h3 {
        height: 1.5rem;
        // Condensed is the default for h3
        font-family: Roboto;
        font-size: 14px;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.71;
        letter-spacing: normal;
        color: $gray-10;
        margin: 0;
      }

      .attributes .custom-control {
        margin-right: 40px;
      }

      .toggle-up .svg-icon {
        width: 1rem;
      }

      .toggle-up svg {
        width: 1rem;
        height: 1rem;
      }

      .toggle-open {
        transform: rotate(180deg);
      }

      .attr-description {
        border-bottom: 1px dashed;
      }

      label {
        height: 1.5rem;
        letter-spacing: normal;
        color: $gray-50;
      }
    }

    .form-radio {
      .custom-control {
        margin-bottom: 0;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .option-item {
      margin-right: 12px !important;
    }
  }

  .streak-addon path {
    fill: $gray-200;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .gold {
    width: 1rem;
    height: 1rem;
  }

  .habit-option {
    &-container {
      min-width: 3rem;

      &:not(:disabled) {
        cursor: pointer;
      }

      &:first-of-type {
        margin-right: 2rem;
      }
    }

    &-button {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
    }

    &-icon {
      width: 10px;
      height: 10px;
      color: $white;

      &.disabled {
        color: $gray-200;
      }

      &.negative {
        margin-top: 0.5rem;
      }
    }

    &-label {
      font-size: 12px;
      font-weight: bold;
      text-align: center;

      &.disabled {
        color: $gray-100;
        font-weight: normal;
      }
    }
  }

  input, textarea, input.form-control, textarea.form-control {
    padding: 0.25rem 0.75rem;
    line-height: 1.71;
  }

  .input-title {
    height: 2rem;
  }

  .input-notes {
    height: 3.5rem;
  }

  label {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
  }

  .flex-group {
    display: flex;

    .flex {
      flex: 1;
    }
  }

  .streak-inputs.both {
    .positive {
      padding-right: 6px;
    }

    .negative {
      padding-left: 6px;
    }
  }

  .input-group-text {
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.71;
    letter-spacing: normal;
    text-align: center;
    color: $gray-50;
    border: 0;
  }

  .disabled .input-group-text {
    color: $gray-200;
  }

</style>

<script>
import axios from 'axios';
import moment from 'moment';
import Datepicker from '@/components/ui/datepicker';
import toggleCheckbox from '@/components/ui/toggleCheckbox';
import markdownDirective from '@/directives/markdown';
import { mapGetters, mapActions, mapState } from '@/libs/store';
import checklist from './modal-controls/checklist';
import SelectMulti from './modal-controls/selectMulti';
import selectDifficulty from '@/components/tasks/modal-controls/selectDifficulty';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';

import syncTask from '../../mixins/syncTask';

import informationIcon from '@/assets/svg/information.svg';
import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';
import streakIcon from '@/assets/svg/streak.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import goldIcon from '@/assets/svg/gold.svg';
import chevronIcon from '@/assets/svg/chevron.svg';
import calendarIcon from '@/assets/svg/calendar.svg';
import gripIcon from '@/assets/svg/grip.svg';


export default {
  components: {
    SelectMulti,
    Datepicker,
    checklist,
    selectDifficulty,
    selectTranslatedArray,
    toggleCheckbox,
    lockableLabel,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [syncTask],
  // purpose is either create or edit, task is the task created or edited
  props: ['task', 'purpose', 'challengeId', 'groupId'],
  data () {
    return {
      showAssignedSelect: false,
      newChecklistItem: null,
      icons: Object.freeze({
        information: informationIcon,
        negative: negativeIcon,
        positive: positiveIcon,
        destroy: deleteIcon,
        gold: goldIcon,
        chevron: chevronIcon,
        streak: streakIcon,
        calendar: calendarIcon,
        grip: gripIcon,
      }),
      members: [],
      membersNameAndId: [],
      memberNamesById: {},
      assignedMembers: [],
      managers: [],
      showAdvancedOptions: false,
      attributesStrings: {
        str: 'strength',
        int: 'intelligence',
        con: 'constitution',
        per: 'perception',
      },
      calendarHighlights: { dates: [new Date()] },
    };
  },
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
      canDeleteTask: 'tasks:canDelete',
    }),
    ...mapState({
      user: 'user.data',
      dayMapping: 'constants.DAY_MAPPING',
      ATTRIBUTES: 'constants.ATTRIBUTES',
    }),
    advancedSettingsAvailable () {
      if (
        this.task.type === 'reward'
        || this.task.type === 'todo'
        || this.purpose === 'create'
        || !this.isUserTask
      ) {
        return false;
      }

      if (this.task.type === 'habit'
        && !this.task.up
        && !this.task.down
      ) {
        return false;
      }

      return true;
    },
    checklistEnabled () {
      return ['daily', 'todo'].indexOf(this.task.type) > -1 && !this.isOriginalChallengeTask;
    },
    isChallengeTask () {
      return Boolean(this.task.challenge && this.task.challenge.id);
    },
    isUserTask () {
      return !this.challengeId && !this.groupId;
    },
    challengeAccessRequired () {
      return this.isUserTask && this.isChallengeTask;
    },
    isOriginalChallengeTask () {
      const isUserChallenge = Boolean(this.task.userId);
      return !isUserChallenge
        && (this.challengeId || (this.task.challenge && this.task.challenge.id));
    },
    canDelete () {
      return this.purpose !== 'create' && this.canDeleteTask(this.task);
    },
    canSave () {
      return this.task && this.task.text && this.task.text.length > 0;
    },
    title () {
      const type = this.$t(this.task.type);
      return this.$t(this.purpose === 'edit' ? 'editATask' : 'createTask', { type });
    },
    repeatSuffix () {
      const { task } = this;

      // once changed it is a string
      const everyXValue = +task.everyX;

      if (task.frequency === 'daily') {
        return everyXValue === 1 ? this.$t('day') : this.$t('days');
      } if (task.frequency === 'weekly') {
        return everyXValue === 1 ? this.$t('week') : this.$t('weeks');
      } if (task.frequency === 'monthly') {
        return everyXValue === 1 ? this.$t('month') : this.$t('months');
      } if (task.frequency === 'yearly') {
        return everyXValue === 1 ? this.$t('year') : this.$t('years');
      }
      return null;
    },
    repeatsOn: {
      get () {
        let repeatsOn = 'dayOfMonth';

        if (this.task.type === 'daily' && this.task.weeksOfMonth && this.task.weeksOfMonth.length > 0) {
          repeatsOn = 'dayOfWeek';
        }

        return repeatsOn;
      },
      set (newRepeatsOn) {
        this.calculateMonthlyRepeatDays(newRepeatsOn);
      },
    },
    selectedTags () {
      return this.getTagsFor(this.task);
    },
  },
  watch: {
    task () {
      this.syncTask();
    },
    'task.startDate': function taskStartDate () {
      this.calculateMonthlyRepeatDays();
    },
    'task.frequency': function taskFrequency () {
      this.calculateMonthlyRepeatDays();
    },
  },
  async mounted () {
    this.showAdvancedOptions = !this.user.preferences.advancedCollapsed;
    if (this.groupId) {
      const groupResponse = await axios.get(`/api/v4/groups/${this.groupId}`);
      this.managers = Object.keys(groupResponse.data.data.managers);
      this.managers.push(groupResponse.data.data.leader._id);
    }
  },
  methods: {
    ...mapActions({
      saveTask: 'tasks:save',
      destroyTask: 'tasks:destroy',
      createTask: 'tasks:create',
      createTag: 'tags:createTag',
    }),
    cssClass (suffix) {
      if (!this.task) {
        return '';
      }

      return this.getTaskClasses(this.task, `${this.purpose === 'edit' ? 'edit' : 'create'}-modal-${suffix}`);
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
    weekdaysMin (dayNumber) {
      return moment.weekdaysMin(dayNumber);
    },
    formattedDate (date) {
      return moment(date).format('MM/DD/YYYY');
    },
    calculateMonthlyRepeatDays (newRepeatsOn) {
      if (!this.task) return;
      const { task } = this;
      const repeatsOn = newRepeatsOn || this.repeatsOn;

      if (task.frequency === 'monthly') {
        if (repeatsOn === 'dayOfMonth') {
          const date = moment(task.startDate).date();
          task.weeksOfMonth = [];
          task.daysOfMonth = [date];
        } else if (repeatsOn === 'dayOfWeek') {
          const week = Math.ceil(moment(task.startDate).date() / 7) - 1;
          const dayOfWeek = moment(task.startDate).day();
          const shortDay = this.dayMapping[dayOfWeek];
          task.daysOfMonth = [];
          task.weeksOfMonth = [week];
          for (const key of Object.keys(task.repeat)) {
            task.repeat[key] = false;
          }
          task.repeat[shortDay] = true;
        }
      }
    },
    async submit () {
      if (!this.canSave) return;
      if (this.newChecklistItem) this.addChecklistItem();

      if (this.task.type === 'reward' && this.task.value === '') {
        this.task.value = 0;
      }

      if (this.purpose === 'create') {
        if (this.challengeId) {
          const response = await this.$store.dispatch('tasks:createChallengeTasks', {
            challengeId: this.challengeId,
            tasks: [this.task],
          });
          Object.assign(this.task, response);
          this.$emit('taskCreated', this.task);
        } else if (this.groupId) {
          const response = await this.$store.dispatch('tasks:createGroupTasks', {
            groupId: this.groupId,
            tasks: [this.task],
          });
          Object.assign(this.task, response);
          await this.$store.dispatch('tasks:assignTask', {
            taskId: this.task._id,
            assignedUserIds: this.assignedMembers,
          });
          this.assignedMembers.forEach(memberId => {
            if (!this.task.assignedUsersDetail) this.task.assignedUsersDetail = {};
            this.task.assignedUsersDetail[memberId] = {
              assignedDate: new Date(),
              assigningUsername: this.user.auth.local.username,
              completed: false,
            };
          });
          this.$emit('taskCreated', this.task);
        } else {
          this.createTask(this.task);
        }
      } else {
        await this.saveTask(this.task);
        this.$emit('taskEdited', this.task);
      }
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    destroy () {
      const type = this.$t(this.task.type);
      if (!window.confirm(this.$t('sureDeleteType', { type }))) return; // eslint-disable-line no-alert
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    cancel () {
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    onClose () {
      this.newChecklistItem = '';
      this.$emit('cancel');
    },
    async toggleAssignment (memberId) {
      if (this.purpose === 'create') {
        return;
      }
      const assignedIndex = this.assignedMembers.indexOf(memberId);
      if (assignedIndex === -1) {
        await this.$store.dispatch('tasks:unassignTask', {
          taskId: this.task._id,
          userId: memberId,
        });
      } else {
        await this.$store.dispatch('tasks:assignTask', {
          taskId: this.task._id,
          assignedUserIds: [memberId],
        });
      }
    },
    async clearAssignments () {
      if (this.purpose === 'edit') {
        for (const assignedMember of this.assignedMembers) {
          await this.$store.dispatch('tasks:unassignTask', { // eslint-disable-line no-await-in-loop
            taskId: this.task._id,
            userId: assignedMember,
          });
        }
      }
      this.assignedMembers = [];
    },
    focusInput () {
      this.$refs.inputToFocus.focus();
    },
    async addTag (name) {
      const tagResult = await this.createTag({ name });

      this.task.tags.push(tagResult.id);
    },
  },
};
</script>

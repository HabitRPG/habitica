<template>
  <b-modal
    id="task-modal"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    size="sm"
    :hide-footer="true"
    @hidden="onClose()"
    @show="handleOpen()"
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
        <div class="ml-auto d-flex align-items-center">
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
          :locked="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
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
          :disabled="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
          :placeholder="$t('addATitle')"
        >
      </div>
      <div
        v-if="isUserTask || isChallengeTask || isOriginalChallengeTask"
        class="form-group mb-0"
      >
        <label
          class="d-flex align-items-center justify-content-between mb-1"
        >
          <span
            :class="cssClass('headings')"
          >{{ $t('notes') }}</span>
          <small>
            <a
              target="_blank"
              href="http://habitica.fandom.com/wiki/Markdown_Cheat_Sheet"
              :class="cssClass('headings')"
            >{{ $t('markdownHelpLink') }}</a>
          </small>
        </label>
        <textarea
          v-model="task.notes"
          class="form-control input-notes"
          :class="cssClass('input')"
          :placeholder="$t('addNotes')"
        ></textarea>
      </div>
      <div
        v-if="showManagerNotes"
        class="form-group mb-0 mt-3"
      >
        <lockable-label
          :class-override="cssClass('headings')"
          :locked="groupAccessRequiredAndOnPersonalPage"
          :text="$t('managerNotes')"
        />
        <textarea
          v-model="managerNotes"
          class="form-control input-notes"
          :class="cssClass('input')"
          :placeholder="$t('addNotes')"
          :disabled="groupAccessRequiredAndOnPersonalPage"
        ></textarea>
      </div>
      <div
        v-if="task.group && task.group.assignedDate && !task.group.assigningUsername"
        class="mt-3 mb-n2"
        :class="cssClass('headings')"
        v-html="$t('assignedDateOnly', {
          date: formattedDate(task.group.assignedDate),
        })"
      >
      </div>
      <div
        v-if="task.group && task.group.assignedDate && task.group.assigningUsername"
        class="mt-3 mb-n2"
        :class="cssClass('headings')"
        v-html="$t('assignedDateAndUser', {
          username: task.group.assigningUsername,
          date: formattedDate(task.group.assignedDate),
        })"
      >
      </div>
    </div>
    <div
      class="task-modal-content px-4"
      :class="cssClass('content')"
    >
      <form
        v-if="task"
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
            :disable-items="groupAccessRequiredAndOnPersonalPage"
            :disable-drag="groupAccessRequiredAndOnPersonalPage"
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
            :disabled="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
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
            :disabled="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
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
        <template v-if="task.type !== 'reward'">
          <div class="d-flex mt-3">
            <lockable-label
              :locked="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
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
            :disabled="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
            @select="setDifficulty($event)"
          />
        </template>
        <div
          v-if="task.type === 'todo' && (task.date
            || !(groupAccessRequiredAndOnPersonalPage || challengeAccessRequired))"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
              :text="$t('dueDate')"
            />
            <datepicker
              v-model="task.date"
              :calendar-icon="icons.calendar"
              :clear-button="!challengeAccessRequired && !groupAccessRequiredAndOnPersonalPage"
              :clear-button-text="$t('clear')"
              :today-button="false"
              :disabled-picker="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :class="{disabled: challengeAccessRequired || groupAccessRequiredAndOnPersonalPage}"
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
              :locked="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :text="$t('startDate')"
            />
            <datepicker
              v-model="task.startDate"
              :calendar-icon="icons.calendar"
              :clear-button="false"
              :today-button="false"
              :disabled-picker="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :class="{disabled: challengeAccessRequired || groupAccessRequiredAndOnPersonalPage}"
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
              :locked="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :text="$t('repeats')"
            />
            <select-translated-array
              :disabled="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
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
              :locked="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :text="$t('repeatEvery')"
            />
            <div
              class="input-group-outer"
              :class="{
                disabled: challengeAccessRequired || groupAccessRequiredAndOnPersonalPage
              }"
            >
              <div class="input-group">
                <input
                  v-model="task.everyX"
                  class="form-control"
                  type="number"
                  min="0"
                  max="9999"
                  required="required"
                  :disabled="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
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
              :locked="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :text="$t('repeatOn')"
            />
            <div class="toggle-group">
              <toggle-checkbox
                v-for="(day, dayNumber) in ['su','m','t','w','th','f','s']"
                :key="dayNumber"
                :tab-index="dayNumber"
                :checked.sync="task.repeat[day]"
                :disabled="groupAccessRequiredAndOnPersonalPage || challengeAccessRequired"
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
          v-if="isUserTask"
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
          v-if="task.type === 'habit'"
          class="option mt-3"
        >
          <div class="form-group">
            <lockable-label
              :locked="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
              :text="$t('resetStreak')"
            />
            <select-translated-array
              :disabled="challengeAccessRequired || groupAccessRequiredAndOnPersonalPage"
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
          <div
            v-if="task.type === 'todo'"
            class="form-group"
          >
            <label
              v-once
              class="mb-1"
            >{{ $t('sharedCompletion') }}</label>
            <select-translated-array
              :items="['recurringCompletion', 'singleCompletion', 'allAssignedCompletion']"
              :value="sharedCompletion"
              @select="sharedCompletion = $event"
            />
          </div>
          <div class="form-group row mt-3 mb-3">
            <label
              v-once
              class="col-12 mb-1"
            >{{ $t('assignedTo') }}</label>
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
          <div class="form-group flex-group mt-3 mb-4">
            <label
              v-once
              class="mb-0 flex"
            >{{ $t('approvalRequired') }}</label>
            <toggle-switch
              class="d-inline-block"
              :checked="requiresApproval"
              @change="updateRequiresApproval"
            />
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
                  >{{ $t('restoreStreak') }}</label>
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
          v-if="purpose !== 'create'
            && !challengeAccessRequired
            && !groupAccessRequiredAndOnPersonalPage"
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
    .modal-dialog.modal-sm {
      max-width: 448px;
    }

    .form-group {
      margin-bottom: 0;
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
      &:not(:host-context(.tags-popup)) {
        border: none;
      }
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

    .modal-body {
      // the body has a margin/padding that can't be found
      // if found please remove that padding and this style
      // margin-bottom: -2rem;
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .cursor-auto {
      cursor: auto;
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

    .vdp-datepicker.disabled, .input-group-outer.disabled {
      .input-group:hover {
        border-color: $gray-400;
      }

      .input-group .form-control {
        background-color: $gray-700;
        border-color: $gray-500;
        color: $gray-200;
      }

      svg path {
        opacity: 0.75;
        fill: $gray-200;
      }
    }

    .vdp-datepicker {
      .input-group-append {
        width: auto;
        min-width: 2rem;
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
import clone from 'lodash/clone';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import toggleSwitch from '@/components/ui/toggleSwitch';
import toggleCheckbox from '@/components/ui/toggleCheckbox';
import markdownDirective from '@/directives/markdown';
import { mapGetters, mapActions, mapState } from '@/libs/store';
import checklist from './modal-controls/checklist';
import SelectMulti from './modal-controls/selectMulti';
import selectDifficulty from '@/components/tasks/modal-controls/selectDifficulty';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';

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
    toggleSwitch,
    checklist,
    selectDifficulty,
    selectTranslatedArray,
    toggleCheckbox,
    lockableLabel,
  },
  directives: {
    markdown: markdownDirective,
  },
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
      requiresApproval: false, // We can't set task.group fields so we use this field to toggle
      sharedCompletion: 'singleCompletion',
      managerNotes: '',
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
        || this.groupAccessRequiredAndOnPersonalPage
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
    groupAccessRequiredAndOnPersonalPage () {
      if (!this.groupId && this.task.group && this.task.group.id) return true;
      return false;
    },
    checklistEnabled () {
      return ['daily', 'todo'].indexOf(this.task.type) > -1
        && !this.isOriginalChallengeTask
        && (!this.groupAccessRequiredAndOnPersonalPage || this.checklist.length > 0);
    },
    showManagerNotes () {
      return Boolean(this.task.group && this.task.group.managerNotes)
        || (
          !this.groupAccessRequiredAndOnPersonalPage && this.managers.indexOf(this.user._id) !== -1
        );
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
    isUserTask () {
      return !this.challengeId && !this.groupId;
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
    async syncTask () {
      if (this.task && this.task.group && this.task.group.managerNotes) {
        this.managerNotes = this.task.group.managerNotes;
      }
      if (this.groupId && this.task.group && this.task.group.approval) {
        this.requiresApproval = this.task.group.approval.required;
      }

      if (this.groupId) {
        const members = await this.$store.dispatch('members:getGroupMembers', {
          groupId: this.groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
        this.membersNameAndId = [];
        this.members.forEach(member => {
          this.membersNameAndId.push({
            id: member._id,
            name: member.auth.local.username,
          });
          this.memberNamesById[member._id] = member.profile.name;
        });
        this.assignedMembers = [];
        if (this.task.group && this.task.group.assignedUsers) {
          this.assignedMembers = this.task.group.assignedUsers;
        }
        if (this.task.group) {
          this.sharedCompletion = this.task.group.sharedCompletion || 'singleCompletion';
        }
      }

      // @TODO: This whole component is mutating a prop
      // and that causes issues. We need to not copy the prop similar to group modals
      if (this.task) this.checklist = clone(this.task.checklist);
    },
    async handleOpen () {
      this.syncTask();
    },
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

      // TODO Fix up permissions on task.group so we don't have to keep doing these hacks
      if (this.groupId) {
        this.task.requiresApproval = this.requiresApproval;
        this.task.group.approval.required = this.requiresApproval;
        this.task.sharedCompletion = this.sharedCompletion;
        this.task.group.sharedCompletion = this.sharedCompletion;
        this.task.managerNotes = this.managerNotes;
        this.task.group.managerNotes = this.managerNotes;
      }

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
          const promises = this.assignedMembers.map(memberId => this.$store.dispatch('tasks:assignTask', {
            taskId: this.task._id,
            userId: memberId,
          }));
          Promise.all(promises);
          this.task.group.assignedUsers = this.assignedMembers;
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
      if (!window.confirm(this.$t('sureDeleteType', { type }))) return;
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    cancel () {
      this.$root.$emit('bv::hide::modal', 'task-modal');
    },
    onClose () {
      if (this.task.group && this.task.group.managerNotes) this.managerNotes = null;
      this.newChecklistItem = '';
      this.$emit('cancel');
    },
    updateRequiresApproval (newValue) {
      let truthy = true;
      if (!newValue) truthy = false; // This return undefined instad of false
      this.requiresApproval = truthy;
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
          userId: memberId,
        });
      }
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

<template>
  <b-modal
    id="task-modal"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    size="sm"
    @hidden="onClose()"
    @show="handleOpen()"
    @shown="focusInput()"
  >
    <div
      v-if="task"
      slot="modal-header"
      class="task-modal-header p-4"
      :class="cssClass('bg')"
      @click="handleClick($event)"
    >
      <div class="d-flex align-items-center mb-3">
        <h2
          class="my-auto"
          :class="cssClassHeadings"
        >
          {{ title }}
        </h2>
        <div class="ml-auto d-flex align-items-center">
          <span
            class="cancel-task-btn mr-3"
            :class="cssClassHeadings"
            @click="cancel()"
          >{{ $t('cancel') }}</span>
          <div
            class="btn btn-secondary d-flex align-items-center justify-content-center"
            :class="{disabled: !canSave}"
            @click="submit()"
          >
            <div
              class="m-auto"
              v-if="purpose === 'edit'"
            >
              {{ $t('save') }}
            </div>
            <div
              class="m-auto"
              v-if="purpose === 'create'"
            >
              {{ $t('create') }}
            </div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label
          :class="cssClassHeadings"
          class="mb-1"
        >{{ `${$t('text')}*` }}</label>
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
      <div class="form-group mb-0">
        <label
          class="d-flex align-items-center justify-content-between mb-1"
        >
          <span
            :class="cssClassHeadings"
          >{{ $t('notes') }}</span>
          <small>
            <a
              target="_blank"
              href="http://habitica.fandom.com/wiki/Markdown_Cheat_Sheet"
              :class="cssClassHeadings"
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
    </div>
    <div
      class="task-modal-content"
      @click="handleClick($event)"
    >
      <form
        v-if="task"
        @submit.stop.prevent="submit()"
        @click="handleClick($event)"
      >
        <div
          v-if="task.type === 'reward'"
          class="option mt-0"
        >
          <div class="form-group">
            <label v-once>{{ $t('cost') }}</label>
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
          class="option mt-0"
        >
          <checklist :items.sync="task.checklist" />
        </div>
        <div
          v-if="task.type === 'habit'"
          class="d-flex justify-content-center"
        >
          <div
            class="habit-option-container no-transition
              d-flex flex-column justify-content-center align-items-center"
            @click="toggleUpDirection()"
            :class="!task.up ? cssClass('habit-control-disabled') : ''"
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
          </div>
          <div
            class="habit-option-container no-transition
              d-flex flex-column justify-content-center align-items-center"
            @click="toggleDownDirection()"
            :class="!task.down ? cssClass('habit-control-disabled') : ''"
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
          </div>
        </div>
        <template v-if="task.type !== 'reward'">
          <label v-once>
            <span class="float-left">{{ $t('difficulty') }}</span>
            <div
              v-b-tooltip.hover.righttop="$t('difficultyHelp')"
              class="svg-icon info-icon"
              v-html="icons.information"
            ></div>
          </label>
          <div class="d-flex justify-content-center difficulty-options">
            <div
              class="option-item"
              :class="task.priority === 0.1 ? 'option-item-selected' : cssClass('option-disabled')"
              @click="setDifficulty(0.1)"
            >
              <div
                class="option-item-box"
                :class="task.priority === 0.1 ? cssClass('bg') : ''"
              >
                <div
                  class="svg-icon difficulty-trivial-icon"
                  v-html="icons.difficultyTrivial"
                ></div>
              </div>
              <div
                class="option-item-label"
                :class="task.priority === 0.1 ? cssClass('text') : ''"
              >
                {{ $t('trivial') }}
              </div>
            </div>
            <div
              class="option-item"
              :class="task.priority === 1 ? 'option-item-selected' : cssClass('option-disabled')"
              @click="setDifficulty(1)"
            >
              <div
                class="option-item-box"
                :class="task.priority === 1 ? cssClass('bg') : ''"
              >
                <div
                  class="svg-icon difficulty-normal-icon"
                  v-html="icons.difficultyNormal"
                ></div>
              </div>
              <div
                class="option-item-label"
                :class="task.priority === 1 ? cssClass('text') : ''"
              >
                {{ $t('easy') }}
              </div>
            </div>
            <div
              class="option-item"
              :class="task.priority === 1.5 ? 'option-item-selected' : cssClass('option-disabled')"
              @click="setDifficulty(1.5)"
            >
              <div
                class="option-item-box"
                :class="task.priority === 1.5 ? cssClass('bg') : ''"
              >
                <div
                  class="svg-icon difficulty-medium-icon"
                  v-html="icons.difficultyMedium"
                ></div>
              </div>
              <div
                class="option-item-label"
                :class="task.priority === 1.5 ? cssClass('text') : ''"
              >
                {{ $t('medium') }}
              </div>
            </div>
            <div
              class="option-item"
              :class="task.priority === 2 ? 'option-item-selected' : cssClass('option-disabled')"
              @click="setDifficulty(2)"
            >
              <div
                class="option-item-box"
                :class="task.priority === 2 ? cssClass('bg') : ''"
              >
                <div
                  class="svg-icon difficulty-hard-icon"
                  v-html="icons.difficultyHard"
                ></div>
              </div>
              <div
                class="option-item-label"
                :class="task.priority === 2 ? cssClass('text') : ''"
              >
                {{ $t('hard') }}
              </div>
            </div>
          </div>
        </template>
        <div
          v-if="task.type === 'todo'"
          class="option"
        >
          <div class="form-group">
            <label v-once>{{ $t('dueDate') }}</label>
            <datepicker
              v-model="task.date"
              :calendar-icon="icons.calendar"
              :clear-button="true"
              :clear-button-text="$t('clear')"
              :today-button="!challengeAccessRequired"
              :today-button-text="$t('today')"
              :disabled-picker="challengeAccessRequired"
              :highlighted="calendarHighlights"
            />
          </div>
        </div>
        <div
          v-if="task.type === 'daily'"
          class="option"
        >
          <div class="form-group">
            <label v-once>{{ $t('startDate') }}</label>
            <datepicker
              v-model="task.startDate"
              :calendar-icon="icons.calendar"
              :clear-button="false"
              :today-button="!challengeAccessRequired"
              :today-button-text="$t('today')"
              :disabled-picker="challengeAccessRequired"
              :highlighted="calendarHighlights"
            />
          </div>
        </div>
        <div
          v-if="task.type === 'daily'"
          class="option"
        >
          <div class="form-group">
            <label v-once>{{ $t('repeats') }}</label>
            <b-dropdown
              class="inline-dropdown"
              :text="$t(task.frequency)"
            >
              <b-dropdown-item
                v-for="frequency in ['daily', 'weekly', 'monthly', 'yearly']"
                :key="frequency"
                :disabled="challengeAccessRequired"
                :class="{active: task.frequency === frequency}"
                @click="task.frequency = frequency"
              >
                {{ $t(frequency) }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="form-group">
            <label v-once>{{ $t('repeatEvery') }}</label>
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
              <div class="input-group-append input-group-text">
                {{ repeatSuffix }}
              </div>
            </div>
          </div>
          <template v-if="task.frequency === 'weekly'">
            <div class="form-group">
              <label
                v-once
                class="d-block"
              >{{ $t('repeatOn') }}</label>
              <div
                v-for="(day, dayNumber) in ['su','m','t','w','th','f','s']"
                :key="dayNumber"
                class="form-check-inline weekday-check mr-0"
              >
                <div class="custom-control custom-checkbox custom-control-inline">
                  <input
                    :id="`weekday-${dayNumber}`"
                    v-model="task.repeat[day]"
                    class="custom-control-input"
                    type="checkbox"
                    :disabled="challengeAccessRequired"
                  >
                  <label
                    v-once
                    class="custom-control-label"
                    :for="`weekday-${dayNumber}`"
                  >{{ weekdaysMin(dayNumber) }}</label>
                </div>
              </div>
            </div>
          </template>
          <template v-if="task.frequency === 'monthly'">
            <label
              v-once
              class="d-block"
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
          </template>
        </div>
        <div
          v-if="isUserTask"
          class="tags-select option"
        >
          <div class="tags-inline form-group row">
            <label
              v-once
              class="col-12"
            >{{ $t('tags') }}</label>
            <div class="col-12">
              <div
                class="category-wrap"
                :class="{ active: showTagsSelect }"
                @click="toggleTagSelect()"
              >
                <span
                  v-if="task.tags && task.tags.length === 0"
                  class="category-select"
                >
                  <div class="tags-none">{{ $t('none') }}</div>
                  <div class="dropdown-toggle"></div>
                </span>
                <span
                  v-else
                  class="category-select"
                >
                  <div
                    v-for="tagName in truncatedSelectedTags"
                    :key="tagName"
                    v-markdown="tagName"
                    class="category-label"
                    :title="tagName"
                  ></div>
                  <div
                    v-if="remainingSelectedTags.length > 0"
                    class="tags-more"
                  >+{{ $t('more', { count: remainingSelectedTags.length }) }}</div>
                  <div class="dropdown-toggle"></div>
                </span>
              </div>
            </div>
          </div>
          <tags-popup
            v-if="showTagsSelect"
            ref="popup"
            v-model="task.tags"
            :tags="user.tags"
            @close="closeTagsPopup()"
          />
        </div>
        <div
          v-if="task.type === 'habit'"
          class="option"
        >
          <div class="form-group">
            <label v-once>{{ $t('resetStreak') }}</label>
            <b-dropdown
              class="inline-dropdown"
              :text="$t(task.frequency)"
              :disabled="challengeAccessRequired"
            >
              <b-dropdown-item
                v-for="frequency in ['daily', 'weekly', 'monthly']"
                :key="frequency"
                :class="{active: task.frequency === frequency}"
                @click="task.frequency = frequency"
              >
                {{ $t(frequency) }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        <div
          v-if="groupId"
          class="option group-options"
        >
          <div
            v-if="task.type === 'todo'"
            class="form-group"
          >
            <label v-once>{{ $t('sharedCompletion') }}</label>
            <b-dropdown
              class="inline-dropdown"
              :text="$t(sharedCompletion)"
            >
              <b-dropdown-item
                v-for="completionOption in [
                  'recurringCompletion', 'singleCompletion', 'allAssignedCompletion']"
                :key="completionOption"
                :class="{active: sharedCompletion === completionOption}"
                @click="sharedCompletion = completionOption"
              >
                {{ $t(completionOption) }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="form-group row">
            <label
              v-once
              class="col-12"
            >{{ $t('assignedTo') }}</label>
            <div class="col-12 mt-2">
              <div
                class="category-wrap"
                @click="showAssignedSelect = !showAssignedSelect"
              >
                <span
                  v-if="assignedMembers && assignedMembers.length === 0"
                  class="category-select"
                >{{ $t('none') }}</span>
                <span
                  v-else
                  class="category-select"
                >
                  <span
                    v-for="memberId in assignedMembers"
                    :key="memberId"
                    class="mr-1"
                  >{{ memberNamesById[memberId] }}</span>
                </span>
              </div>
              <div
                v-if="showAssignedSelect"
                class="category-box"
              >
                <div class="container">
                  <div class="row">
                    <div
                      v-for="member in members"
                      :key="member._id"
                      class="form-check col-6"
                    >
                      <div class="custom-control custom-checkbox">
                        <input
                          :id="`assigned-${member._id}`"
                          v-model="assignedMembers"
                          class="custom-control-input"
                          type="checkbox"
                          :value="member._id"
                          @change="toggleAssignment(member._id)"
                        >
                        <label
                          v-once
                          class="custom-control-label"
                          :for="`assigned-${member._id}`"
                        >{{ member.profile.name }}</label>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <button
                      class="btn btn-primary"
                      @click.stop.prevent="showAssignedSelect = !showAssignedSelect"
                    >
                      {{ $t('close') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label v-once>{{ $t('approvalRequired') }}</label>
            <toggle-switch
              class="d-inline-block"
              :checked="requiresApproval"
              @change="updateRequiresApproval"
            />
          </div>
        </div>
        <div
          v-if="advancedSettingsAvailable"
          class="advanced-settings"
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
                v-html="icons.down"
              ></div>
            </div>
          </div>
          <b-collapse
            id="advancedOptionsCollapse"
            v-model="showAdvancedOptions"
          >
            <div class="advanced-settings-body">
              <div
                v-if="task.type === 'daily' && isUserTask && purpose === 'edit'"
                class="option"
              >
                <div class="form-group">
                  <label v-once>{{ $t('restoreStreak') }}</label>
                  <div class="input-group">
                    <div class="input-group-prepend streak-addon input-group-icon">
                      <div
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
                class="option"
              >
                <div class="form-group">
                  <label v-once>{{ $t('restoreStreak') }}</label>
                  <div class="row">
                    <div
                      v-if="task.up"
                      class="col-6"
                    >
                      <div class="input-group">
                        <div class="input-group-prepend positive-addon input-group-icon">
                          <div
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
                      class="col-6"
                    >
                      <div class="input-group">
                        <div class="input-group-prepend negative-addon input-group-icon">
                          <div
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
              <!--.option(v-if="isUserTask && task.type !== 'reward'").form-group
  label(v-once)
    span.float-left {{ $t('attributeAllocation') }}
    .svg-icon.info-icon(v-html="ic
    ons.information", v-b-tooltip.hover.righttop.html="$t('attributeAllocationHelp')")
  .attributes
    .custom-control.custom-radio.custom-
    control-inline(v-for="attr in ATTRIBUTES", :key="attr")
      input.custom-control-input(:id="`attribute-${a
      ttr}`", type="radio", :value="attr", v-model="task.attribute", :disabled="us
      er.preferences.allocationMode !== 'taskbased'")
              label.custom-control-label.attr-
              description(:for="`attribute-${attr}`", v-once, v-b-pop
              over.hover="$t(`${attr}Text`)") {{ $t(attributesStrings[attr]) }}-->
            </div>
          </b-collapse>
        </div>
        <div
          v-if="purpose !== 'create' && !challengeAccessRequired"
          class="delete-task-btn d-flex justify-content-center align-items-middle"
          @click="destroy()"
        >
          <div
            class="svg-icon d-inline-b mt-1 mb-1"
            v-html="icons.destroy"
          ></div>
          <span class="delete-text mt-1 mb-1">
            {{ $t('deleteTaskType', { type: $t(task.type) }) }}
          </span>
        </div>
      </form>
    </div>
    <div
      slot="modal-footer"
      class="task-modal-footer d-flex justify-content-center align-items-center"
      @click="handleClick($event)"
    >
      <div
        v-if="purpose === 'create'"
        class="btn btn-primary btn-footer
          d-flex align-items-center justify-content-center mt-2 mb-2"
        :class="{disabled: !canSave}"
        @click="submit()"
      >
        {{ $t('create') }}
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #task-modal {
    .modal-dialog.modal-sm {
      max-width: 448px;
    }

    .no-transition {
      transition: none;
    }

    .form-control:not(.input-title):not(.input-notes):not(.checklist-item) {
      height: 40px !important; // until the new changes of teams-2020 are applied
    }

    // until the new changes of teams-2020 are applied
    .vdp-datepicker {
      .input-group-append {
        height: 40px !important;
      }
    }

    input, textarea {
      &:not(:host-context(.tags-popup)) {
        border: none;
      }
      transition-property: border-color, box-shadow, color, background;
      background-color: rgba(255, 255, 255, 0.5);
      &:focus, &:active, &:hover {
        background-color: rgba(255, 255, 255, 0.75);
      }
    }

    .modal-content {
      border-radius: 8px;
      border: none;
    }

    .modal-body {
      // the body has a margin/padding that can't be found
      // if found please remove that padding and this style
      margin-bottom: -1rem;
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .task-modal-content, .task-modal-header {
      padding-left: 23px;
      padding-right: 23px;
    }

    .cursor-auto {
      cursor: auto;
    }

    .task-modal-header {
      color: $white;
      width: 100%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding-top: 16px;
      padding-bottom: 24px;

      h2 {
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

      .custom-control-label p {
        word-break: break-word;
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
              padding: .5em 1em;
              width: 68px;

              // Applies to v-markdown generated p tag.
              p {
                margin-bottom: 0px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                word-wrap: break-word;
              }
            }
          }
        }
      }

      .tags-popup {
        position: absolute;
        top: 100%;
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
        }
        margin-right: 0.5rem;
        color: $maroon-50;
      }
    }

    .task-modal-footer {
      margin: 0;
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
  @import '~@/assets/scss/colors.scss';

  .gold {
    width: 24px;
    margin: 0 7px;
  }

  .habit-option {
    &-container {
      min-width: 3rem;
      cursor: pointer;
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
</style>

<script>
import clone from 'lodash/clone';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import toggleSwitch from '@/components/ui/toggleSwitch';
import markdownDirective from '@/directives/markdown';
import { mapGetters, mapActions, mapState } from '@/libs/store';
import TagsPopup from './tagsPopup';
import checklist from './modal-controls/checklist';

import informationIcon from '@/assets/svg/information.svg';
import difficultyTrivialIcon from '@/assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from '@/assets/svg/difficulty-medium.svg';
import difficultyHardIcon from '@/assets/svg/difficulty-hard.svg';
import difficultyNormalIcon from '@/assets/svg/difficulty-normal.svg';
import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';
import streakIcon from '@/assets/svg/streak.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import goldIcon from '@/assets/svg/gold.svg';
import downIcon from '@/assets/svg/down.svg';
import calendarIcon from '@/assets/svg/calendar.svg';

export default {
  components: {
    TagsPopup,
    Datepicker,
    toggleSwitch,
    checklist,
  },
  directives: {
    markdown: markdownDirective,
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
      sharedCompletion: 'singleCompletion',
      members: [],
      memberNamesById: {},
      assignedMembers: [],
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
      getTagsFor: 'tasks:getTagsFor',
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
      ) return false;
      return true;
    },
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

      if (task.frequency === 'daily') {
        return task.everyX === 1 ? this.$t('day') : this.$t('days');
      } if (task.frequency === 'weekly') {
        return task.everyX === 1 ? this.$t('week') : this.$t('weeks');
      } if (task.frequency === 'monthly') {
        return task.everyX === 1 ? this.$t('month') : this.$t('months');
      } if (task.frequency === 'yearly') {
        return task.everyX === 1 ? this.$t('year') : this.$t('years');
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
    truncatedSelectedTags () {
      return this.selectedTags.slice(0, this.maxTags);
    },
    remainingSelectedTags () {
      return this.selectedTags.slice(this.maxTags);
    },
    cssClassHeadings () {
      const textClass = this.cssClass('text');
      if (textClass.indexOf('purple') !== -1 || textClass.indexOf('worst') !== -1) return null;
      return textClass;
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
  mounted () {
    this.showAdvancedOptions = !this.user.preferences.advancedCollapsed;
  },
  created () {
    document.addEventListener('keyup', this.handleEsc);
  },
  beforeDestroy () {
    document.removeEventListener('keyup', this.handleEsc);
  },
  methods: {
    ...mapActions({ saveTask: 'tasks:save', destroyTask: 'tasks:destroy', createTask: 'tasks:create' }),
    async syncTask () {
      if (this.groupId && this.task.group && this.task.group.approval) {
        this.requiresApproval = this.task.group.approval.required;
      }

      if (this.groupId) {
        const members = await this.$store.dispatch('members:getGroupMembers', {
          groupId: this.groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
        this.members.forEach(member => {
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
    weekdaysMin (dayNumber) {
      return moment.weekdaysMin(dayNumber);
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
        this.saveTask(this.task);
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
      const assignedIndex = this.assignedMembers.indexOf(memberId);

      if (assignedIndex === -1) {
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
    focusInput () {
      this.$refs.inputToFocus.focus();
    },
    handleEsc (e) {
      if (e.keyCode === 27 && this.showTagsSelect) {
        this.closeTagsPopup();
      }
    },
    handleClick (e) {
      if (this.$refs.popup && !this.$refs.popup.$el.parentNode.contains(e.target)) {
        this.closeTagsPopup();
      }
    },
  },
};
</script>

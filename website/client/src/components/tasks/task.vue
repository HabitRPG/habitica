<template>
  <div class="task-wrapper" draggable>
    <div
      class="task transition"
      :class="[{
        'groupTask': task.group.id,
        'task-not-editable': !teamManagerAccess,
        'task-not-scoreable': showTaskLockIcon,
        'link-exempt': !isChallengeTask && !isGroupTask,
      }, `type_${task.type}`
      ]"
      @click="castEnd($event, task)"
    >
      <div
        class="d-flex"
        :class="{'task-not-scoreable': showTaskLockIcon }"
      >
        <!-- Habits left side control-->
        <div
          v-if="task.type === 'habit'"
          class="left-control d-flex justify-content-center pt-3"
          :class="[{
            'control-bottom-box': task.group.id && !isOpenTask,
            'control-top-box': approvalsClass
          }, controlClass.up.bg]"
        >
          <div
            class="task-control habit-control"
            :class="[{
              'habit-control-positive-enabled': task.up && !showTaskLockIcon,
              'habit-control-positive-disabled': !task.up && !showTaskLockIcon,
              'task-not-scoreable': showTaskLockIcon,
            }, controlClass.up.inner]"
            tabindex="0"
            role="button"
            :aria-label="$t('scoreUp')"
            :aria-disabled="showTaskLockIcon || (!task.up && !showTaskLockIcon)"
            @click="score('up')"
            @keypress.enter="score('up')"
          >
            <div
              v-if="showTaskLockIcon"
              class="svg-icon lock"
              :class="task.up ? controlClass.up.icon : 'positive'"
              v-html="icons.lock"
            ></div>
            <div
              v-else
              class="svg-icon positive"
              v-html="icons.positive"
            ></div>
          </div>
        </div>
        <!-- Dailies and todos left side control-->
        <div
          v-if="task.type === 'daily' || task.type === 'todo'"
          class="left-control d-flex justify-content-center"
          :class="[{
            'control-bottom-box': task.group.id && !isOpenTask,
            'control-top-box': approvalsClass}, controlClass.bg]"
        >
          <div
            class="task-control daily-todo-control"
            :class="[
              { 'task-not-scoreable': showTaskLockIcon },
              controlClass.inner,
            ]"
            tabindex="0"
            role="checkbox"
            @click="score(showCheckIcon ? 'down' : 'up' )"
            @keypress.enter="score(showCheckIcon ? 'down' : 'up' )"
          >
            <div
              v-if="showTaskLockIcon"
              class="svg-icon lock"
              :class="controlClass.icon"
              v-html="icons.lock"
            ></div>
            <div
              v-else
              class="svg-icon check"
              :class="{
                'display-check-icon': showCheckIcon,
                [controlClass.checkbox]: true,
              }"
              v-html="icons.check"
            ></div>
          </div>
        </div>
        <!-- Task title, description and icons-->
        <div
          class="task-content"
          :class="contentClass"
        >
          <div
            class="task-clickable-area pt-1 pl-75 pb-0"
            :class="{ 'cursor-auto': !teamManagerAccess }"
            tabindex="0"
            @click="edit($event, task)"
            @keypress.enter="edit($event, task)"
          >
            <div class="d-flex justify-content-between">
              <h3
                v-markdown="task.text"
                class="task-title markdown"
                :class="{ 'has-notes': task.notes }"
              ></h3>
              <menu-dropdown
                v-if="!isRunningYesterdailies && showOptions"
                ref="taskDropdown"
                v-b-tooltip.hover.top="$t('options')"
                tabindex="0"
                class="task-dropdown mr-1"
                :right="task.type === 'reward'"
              >
                <div slot="dropdown-toggle">
                  <div
                    class="svg-icon dropdown-icon"
                    v-html="icons.menu"
                  ></div>
                </div>
                <div slot="dropdown-content">
                  <div
                    v-if="showEdit"
                    ref="editTaskItem"
                    class="dropdown-item edit-task-item"
                    tabindex="0"
                    @keypress.enter="edit($event, task)"
                  >
                    <span class="dropdown-icon-item">
                      <span
                        class="svg-icon inline edit-icon"
                        v-html="icons.edit"
                      ></span>
                      <span class="text">{{ $t('edit') }}</span>
                    </span>
                  </div>
                  <div
                    class="dropdown-item"
                    tabindex="0"
                    @click="moveToTop"
                    @keypress.enter="moveToTop"
                  >
                    <span class="dropdown-icon-item">
                      <span
                        class="svg-icon inline push-to-top"
                        v-html="icons.top"
                      ></span>
                      <span class="text">{{ $t('taskToTop') }}</span>
                    </span>
                  </div>
                  <div
                    class="dropdown-item"
                    tabindex="0"
                    @click="moveToBottom"
                    @keypress.enter="moveToBottom"
                  >
                    <span class="dropdown-icon-item">
                      <span
                        class="svg-icon inline push-to-bottom"
                        v-html="icons.bottom"
                      ></span>
                      <span class="text">{{ $t('taskToBottom') }}</span>
                    </span>
                  </div>
                  <div
                    v-if="showDelete"
                    class="dropdown-item"
                    tabindex="0"
                    @click="destroy"
                    @keypress.enter="destroy"
                  >
                    <span class="dropdown-icon-item delete-task-item">
                      <span
                        class="svg-icon inline delete"
                        v-html="icons.delete"
                      ></span>
                      <span class="text">{{ $t('delete') }}</span>
                    </span>
                  </div>
                </div>
              </menu-dropdown>
            </div>
            <div
              v-markdown="task.notes"
              class="task-notes small-text"
              :class="{'has-checklist': task.notes && hasChecklist}"
            ></div>
          </div>
          <div
            v-if="canViewchecklist"
            class="checklist"
            :class="{isOpen: !task.collapseChecklist}"
          >
            <div class="d-inline-flex">
              <div
                v-b-tooltip.hover.right="$t(`${task.collapseChecklist
                  ? 'expand': 'collapse'}Checklist`)"
                class="collapse-checklist mb-2 d-flex align-items-center expand-toggle"
                :class="{open: !task.collapseChecklist}"
                tabindex="0"
                @click="collapseChecklist(task)"
                @keypress.enter="collapseChecklist(task)"
              >
                <div
                  v-once
                  class="svg-icon"
                  v-html="icons.checklist"
                ></div>
                <span>{{ checklistProgress }}</span>
              </div>
            </div>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="item in task.checklist"
              v-if="!task.collapseChecklist"
              :key="item.id"
              class="custom-control custom-checkbox checklist-item"
              :class="{'checklist-item-done': item.completed, 'cursor-auto': showTaskLockIcon}"
            >
              <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              <input
                :id="`checklist-${item.id}-${random}`"
                class="custom-control-input"
                tabindex="0"
                type="checkbox"
                :checked="item.completed"
                :disabled="castingSpell || showTaskLockIcon"
                @change="toggleChecklistItem(item)"
                @keypress.enter="toggleChecklistItem(item)"
              >
              <label
                v-markdown="item.text"
                class="custom-control-label"
                :class="{ 'cursor-auto': showTaskLockIcon }"
                :for="`checklist-${item.id}-${random}`"
              ></label>
            </div>
          </div>
          <div class="icons small-text d-flex align-items-center">
            <div
              v-if="task.type === 'todo' && task.date"
              class="d-flex align-items-center"
              :class="{'due-overdue': checkIfOverdue() }"
            >
              <div
                v-b-tooltip.hover.bottom="$t('dueDate')"
                class="svg-icon calendar my-auto"
                v-html="icons.calendar"
              ></div>
              <span>{{ formatDueDate() }}</span>
            </div>
            <div class="icons-right d-flex justify-content-end">
              <div
                v-if="showStreak"
                class="d-flex align-items-center"
              >
                <div
                  v-b-tooltip.hover.bottom="task.type === 'daily'
                    ? $t('streakCounter') : $t('counter')"
                  class="svg-icon streak"
                  v-html="icons.streak"
                ></div>
                <span v-if="task.type === 'daily'">{{ task.streak }}</span>
                <span v-if="task.type === 'habit'">
                  <span
                    v-if="task.up && task.counterUp != 0 && task.down"
                    class="m-0"
                  >+{{ task.counterUp }}</span>
                  <span
                    v-else-if=" task.counterUp !=0 && task.counterDown ==0"
                    class="m-0"
                  >{{ task.counterUp }}</span>
                  <span
                    v-else-if="task.up"
                    class="m-0"
                  >0</span>
                  <span
                    v-if="task.up && task.down"
                    class="m-0"
                  >&nbsp;|&nbsp;</span>
                  <span
                    v-if="task.down && task.counterDown != 0 && task.up"
                    class="m-0"
                  >-{{ task.counterDown }}</span>
                  <span
                    v-else-if="task.counterDown !=0 && task.counterUp ==0"
                    class="m-0"
                  >{{ task.counterDown }}</span>
                  <span
                    v-else-if="task.down"
                    class="m-0"
                  >0</span>
                </span>
              </div>
              <div
                v-if="task.challenge && task.challenge.id"
                class="d-flex align-items-center"
              >
                <div
                  v-if="!task.challenge.broken"
                  v-b-tooltip.hover.bottom="shortName"
                  class="svg-icon challenge"
                  v-html="icons.challenge"
                ></div>
                <div
                  v-if="task.challenge.broken"
                  v-b-tooltip.hover.bottom="$t('brokenChaLink')"
                  class="svg-icon challenge broken"
                  @click="handleBrokenTask(task)"
                  v-html="icons.brokenChallengeIcon"
                ></div>
              </div>
              <div
                v-if="hasTags && !task.group.id"
                :id="`tags-icon-${task._id}`"
                class="d-flex align-items-center"
              >
                <div
                  class="svg-icon tags"
                  v-html="icons.tags"
                ></div>
              </div>
              <b-popover
                v-if="hasTags && !task.group.id"
                :target="`tags-icon-${task._id}`"
                triggers="hover"
                placement="bottom"
              >
                <div class="tags-popover">
                  <div class="d-flex align-items-center tags-container">
                    <div
                      v-once
                      class="tags-popover-title"
                    >
                      {{ `${$t('tags')}:` }}
                    </div>
                    <div
                      v-for="tag in getTagsFor(task)"
                      :key="tag"
                      v-markdown="tag"
                      class="tag-label"
                    ></div>
                  </div>
                </div>
              </b-popover>
            </div>
          </div>
        </div>
        <!-- Habits right side control-->
        <div
          v-if="task.type === 'habit'"
          class="right-control d-flex justify-content-center pt-3"
          :class="[{
            'control-bottom-box': task.group.id && !isOpenTask,
            'control-top-box': approvalsClass}, controlClass.down.bg]"
        >
          <div
            class="task-control habit-control"
            :class="[{
              'habit-control-negative-enabled': task.down && !showTaskLockIcon,
              'habit-control-negative-disabled': !task.down && !showTaskLockIcon,
              'task-not-scoreable': showTaskLockIcon,
            }, controlClass.down.inner]"
            tabindex="0"
            role="button"
            :aria-label="$t('scoreDown')"
            :aria-disabled="showTaskLockIcon || (!task.down && !showTaskLockIcon)"
            @click="score('down')"
            @keypress.enter="score('down')"
          >
            <div
              v-if="showTaskLockIcon"
              class="svg-icon lock"
              :class="task.down ? controlClass.down.icon : 'negative'"
              v-html="icons.lock"
            ></div>
            <div
              v-else
              class="svg-icon negative"
              v-html="icons.negative"
            ></div>
          </div>
        </div>
        <!-- Rewards right side control-->
        <div
          v-if="task.type === 'reward'"
          class="right-control d-flex align-items-center justify-content-center reward-control"
          :class="[
            { 'task-not-scoreable': showTaskLockIcon },
            controlClass.bg,
          ]"
          tabindex="0"
          @click="score('down')"
          @keypress.enter="score('down')"
        >
          <div
            v-if="showTaskLockIcon"
            class="svg-icon color lock"
            v-html="icons.lock"
          ></div>
          <div
            v-else
            class="svg-icon mb-1"
            v-html="icons.gold"
          ></div>
          <div class="small-text">
            {{ task.value }}
          </div>
        </div>
      </div>
      <approval-footer
        v-if="task.group.id && !isOpenTask"
        :task="task"
        :group="group"
      />
    </div>
  </div>
</template>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  .task-best-control-inner-habit:focus {
    transition: none;
  }

  *:focus {
    outline: none;
    transition: none;
    border: $purple-400 solid 1px;

    :not(task-best-control-inner-habit) { // round icon
      border-radius: 4px;
    }
  }

  .control-bottom-box {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  .control-top-box {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }

  .cursor-auto {
    cursor: auto !important;
  }

  .task {
    margin-bottom: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    background: white;
    border-radius: 4px;
    position: relative;

    &:hover:not(.task-not-editable.task-not-scoreable),
    &:focus-within:not(.task-not-editable.task-not-scoreable) {
      box-shadow: 0 1px 8px 0 rgba($black, 0.12), 0 4px 4px 0 rgba($black, 0.16);
      z-index: 11;
    }
  }

  .task:not(.groupTask) {
    &:hover,
    &:focus-within {
      .left-control, .right-control, .task-content {
        border-color: $purple-400;
      }
    }
  }

  .task.groupTask {
    &:hover:not(.task-not-editable.task-not-scoreable),
    &:focus-within:not(.task-not-editable.task-not-scoreable) {
      border: $purple-400 solid 1px;
      border-radius: 5px;
      margin: -1px; // to counter the border width
      margin-bottom: 1px;
      transition: none; // with transition, the border color switches from black to $purple-400
    }
  }

  .task-habit-disabled-control-habit:hover {
    cursor: initial;
  }

  .task-title {
    padding-bottom: 8px;

    margin-right: 15px;
    overflow-wrap: break-word;

    // markdown p-tag, can't find without ::v-deep
    ::v-deep p {
      margin-bottom: 0;
    }

    &.has-notes {
      margin-bottom: 0px;
      padding-bottom: 4px;
    }

    /**
    * Fix flex-wrapping for IE 11
    * https://github.com/HabitRPG/habitica/issues/9754
    */
    @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
      flex: 1;
    }
  }

  .task-clickable-area {
    border: transparent solid 1px;
    cursor: pointer;

    &-user {
      padding-right: 0px;
    }

    &:focus {
      border-radius: 4px;
      border: $purple-400 solid 1px;
    }
  }

  .task-title + .task-dropdown ::v-deep .dropdown-menu {
    margin-top: 2px !important;
  }

  .dropdown-icon {
    width: 4px;
    height: 16px;
    margin-right: 0px;
    color: $gray-100 !important;
  }

  .task ::v-deep .habitica-menu-dropdown .habitica-menu-dropdown-toggle {
    opacity: 0;
    padding: 0 8px;
    transition: opacity 0.15s ease-in;
  }

  .task:hover ::v-deep .habitica-menu-dropdown .habitica-menu-dropdown-toggle {
    opacity: 1;
  }

  .task:focus-within ::v-deep .habitica-menu-dropdown .habitica-menu-dropdown-toggle {
    opacity: 1;
  }

  .task ::v-deep .habitica-menu-dropdown:focus-within {
    opacity: 1;
    border: $purple-400 solid 1px;
    border-radius: 2px;
  }

  .task ::v-deep .habitica-menu-dropdown {
    border: transparent solid 1px;
  }

  .task-clickable-area ::v-deep .habitica-menu-dropdown.open .habitica-menu-dropdown-toggle {
    opacity: 1;

    .svg-icon {
      color: $purple-400 !important;
    }
  }

  .task-clickable-area ::v-deep .habitica-menu-dropdown .habitica-menu-dropdown-toggle:hover .svg-icon {
    color: $purple-400 !important;
  }

  .task-clickable-area ::v-deep .habitica-menu-dropdown .habitica-menu-dropdown-toggle:focus-within .svg-icon {
    color: $purple-400 !important;
  }

  .task-dropdown {
    height: 16px;
    width: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .task-dropdown ::v-deep .dropdown-menu {
    .dropdown-item {
      cursor: pointer !important;
      transition: none;
      border: transparent solid 1px;

      * {
        transition: none;
      }

      &:hover,
      &:focus {
        color: $purple-300;

        .svg-icon.push-to-top, .svg-icon.push-to-bottom {
          * {
            stroke: $purple-300;
          }
        }
      }

      &:focus {
        border-radius: 2px;
        border: $purple-400 solid 1px;
      }
    }
  }

  .task-notes {
    color: $gray-100;
    font-style: normal;
    padding-right: 20px;
    min-width: 0px;
    overflow-wrap: break-word;

    &.has-checklist {
      padding-bottom: 2px;
    }
  }

  .task-content {
    padding-top: 0px;
    padding-bottom: 7px;
    flex-grow: 1;
    background: $white;
    border: 1px solid transparent;
    transition-duration: 0.15;
    min-width: 0px;

    &.no-right-border {
      border-right: none !important;
    }

    &.reward-content {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
  }

  .checklist.isOpen {
    margin-bottom: 2px;
  }

  .collapse-checklist {
    padding: 2px 6px;
    border-radius: 1px;
    background-color: $gray-600;
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    color: $gray-200;
    border: transparent solid 1px;
    cursor: pointer;

    &:focus {
      border: $purple-400 solid 1px;
    }

    span {
      margin: 0px 4px;
    }

    .svg-icon {
      width: 12px;
      height: 8px;
    }
  }

  .checklist-item {
    color: $gray-50;
    font-size: 14px;
    line-height: 1.43;
    margin-bottom: -3px;
    min-height: 0px;
    width: 100%;
    margin-left: 0;
    padding-right: 20px;
    overflow-wrap: break-word;

    &-done {
      color: $gray-300;
      text-decoration: line-through;
    }

    .custom-control-label::before, .custom-control-label::after {
      margin-top: -2px;
    }

    .custom-control-label {
      cursor: pointer;
      margin-left: 6px;
      padding-top: 0px;
      min-width: 0px;
      width: 100%;
    }
  }

  .icons, .checklist {
    padding: 0 8px;
  }

  .icons {
    margin-top: 4px;
    color: $gray-100;
    font-style: normal;

    &-right {
      flex-grow: 1;
    }
  }

  .icons-right .svg-icon {
    margin-left: 8px;
  }

  .icons span {
    margin-left: 4px;
  }

  .svg-icon.streak {
    width: 11.6px;
    height: 7.1px;
  }

  .delete-task-item {
    color: $red-10;
  }

  .edit-task-item span.text {
    margin-left: -3px;
  }

  .svg-icon.edit-icon {
    width: 16px;
    height: 16px;
  }

  .svg-icon.push-to-top, .svg-icon.push-to-bottom {
    width: 10px;
    height: 11px;
    margin-left: 3px;

    svg {
      stroke: $purple-300;
    }
  }

  .svg-icon.delete {
    width: 14px;
    height: 16px;
  }

  .tags.svg-icon, .calendar.svg-icon {
    width: 14px;
    height: 14px;
  }

  .tags:hover {
    color: $purple-500;
  }

  .due-overdue {
    color: $maroon-10;
  }

  .calendar.svg-icon {
    margin-right: 2px;
    margin-top: -2px;
  }

  .challenge.svg-icon {
    width: 14px;
    height: 12px;
  }

  .check.svg-icon {
    width: 16px;
    height: 16px;
    margin: 5px;
  }

  .challenge.broken {
    color: $red-50;
  }

  .left-control, .right-control {
    width: 40px;
    flex-shrink: 0;
  }

  .left-control, .right-control, .task-control {
    border: transparent solid 1px;

    &:focus {
      border: $purple-400 solid 1px;
    }
  }
  .left-control {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    min-height: 60px;
    border: 1px solid transparent;
    border-right: none;

    & + .task-content {
      border-left: none;
    }
  }
  .task:not(.type_habit) {
    .left-control {
      & + .task-content {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }

  .right-control {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    min-height: 56px;
    border: 1px solid transparent;
    border-left: none;
  }

  .task-control:not(.task-disabled-habit-control-inner), .reward-control {
    cursor: pointer;
  }

  .task-not-scoreable {
    .task-control, .reward-control {
      cursor: default !important;
    }

    .svg-icon.check:not(.display-check-icon) {
      display: none !important;
    }
  }

  .daily-todo-control {
    margin-top: 16px;
    border-radius: 2px;
    margin-left: -1px;
  }

  .reward-control {
    flex-direction: column;
    padding-top: 8px;
    padding-bottom: 4px;

    .svg-icon {
      width: 24px;
      height: 24px;
    }

    .lock {
      color: $gray-200;
      width: 15px;
    }

    .small-text {
      font-style: initial;
      font-weight: bold;
    }
  }

  .tags-popover ::v-deep {
    .tags-container {
      flex-wrap: wrap;
      margin-top: -3px;
      margin-bottom: -3px;
    }

    .tags-popover-title {
      margin-right: 4px;
      display: block;
      float: left;
      margin-top: -3px;
      margin-bottom: -3px;
    }

    .tag-label {
      display: block;
      float: left;
      margin-left: 4px;
      border-radius: 100px;
      background-color: $gray-50;
      padding: 4px 10px;
      color: $gray-300;
      white-space: nowrap;
      margin-top: 3px;
      margin-bottom: 3px;

      // Applies to v-markdown generated p tag.
      p {
        margin-bottom: 0px;
      }
    }
  }
</style>
<!-- eslint-enable max-len -->
<!-- eslint-disable-next-line vue/component-tags-order -->
<script>
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import isEmpty from 'lodash/isEmpty';
import { mapState, mapGetters, mapActions } from '@/libs/store';

import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';
import goldIcon from '@/assets/svg/gold.svg';
import streakIcon from '@/assets/svg/streak.svg';
import calendarIcon from '@/assets/svg/calendar.svg';
import challengeIcon from '@/assets/svg/challenge.svg';
import brokenChallengeIcon from '@/assets/svg/broken-megaphone.svg';
import tagsIcon from '@/assets/svg/tags.svg';
import checkIcon from '@/assets/svg/check.svg';
import editIcon from '@/assets/svg/edit.svg';
import topIcon from '@/assets/svg/top.svg';
import bottomIcon from '@/assets/svg/bottom.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import checklistIcon from '@/assets/svg/checklist.svg';
import lockIcon from '@/assets/svg/lock.svg';
import menuIcon from '@/assets/svg/menu.svg';
import markdownDirective from '@/directives/markdown';
import scoreTask from '@/mixins/scoreTask';
import sync from '@/mixins/sync';
import approvalFooter from './approvalFooter';
import MenuDropdown from '../ui/customMenuDropdown';

export default {
  components: {
    approvalFooter,
    MenuDropdown,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [scoreTask, sync],
  // @TODO: maybe we should store the group on state?
  props: {
    task: {},
    isUser: {},
    group: {},
    challenge: {},
    dueDate: {},
    isYesterdaily: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      random: uuid(), // used to avoid conflicts between checkboxes ids
      icons: Object.freeze({
        positive: positiveIcon,
        negative: negativeIcon,
        gold: goldIcon,
        streak: streakIcon,
        calendar: calendarIcon,
        challenge: challengeIcon,
        brokenChallengeIcon,
        tags: tagsIcon,
        check: checkIcon,
        checklist: checklistIcon,
        delete: deleteIcon,
        edit: editIcon,
        top: topIcon,
        bottom: bottomIcon,
        menu: menuIcon,
        lock: lockIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      castingSpell: 'spellOptions.castingSpell',
      isRunningYesterdailies: 'isRunningYesterdailies',
    }),
    ...mapGetters({
      getTagsFor: 'tasks:getTagsFor',
      getTaskClasses: 'tasks:getTaskClasses',
      canDelete: 'tasks:canDelete',
      canEdit: 'tasks:canEdit',
    }),
    hasChecklist () {
      return this.task.checklist && this.task.checklist.length > 0;
    },
    canViewchecklist () {
      const userIsTaskUser = this.task.userId ? this.task.userId === this.user._id : true;
      return this.hasChecklist && userIsTaskUser;
    },
    checklistProgress () {
      const totalItems = this.task.checklist.length;
      const completedItems = this.task.checklist
        .reduce((total, item) => (item.completed ? total + 1 : total), 0);
      return `${completedItems}/${totalItems}`;
    },
    leftControl () {
      const { task } = this;
      if (task.type === 'reward') return false;
      return true;
    },
    rightControl () {
      const { task } = this;
      if (task.type === 'reward') return true;
      if (task.type === 'habit') return true;
      return false;
    },
    approvalsClass () {
      return this.group && this.task.approvals && this.task.approvals.length > 0;
    },
    controlClass () {
      return this.getTaskClasses(this.task, 'control', this.dueDate);
    },
    contentClass () {
      const { type } = this.task;

      const classes = [];
      classes.push(this.getTaskClasses(this.task, 'control', this.dueDate).content);

      if (type === 'reward' || type === 'habit') {
        classes.push('no-right-border');
      }

      if (type === 'reward') {
        classes.push('reward-content');
      }

      return classes;
    },
    showStreak () {
      if (!this.task.userId) return false;
      if (this.task.streak !== undefined) return true;
      if (this.task.type === 'habit' && (this.task.up || this.task.down)) return true;
      return false;
    },
    hasTags () {
      return this.task.tags && this.task.tags.length > 0;
    },
    shortName () {
      if (this.task.challenge.broken) return '';

      return this.task.challenge.shortName ? this.task.challenge.shortName.toString() : '';
    },
    isChallengeTask () {
      return !isEmpty(this.task.challenge);
    },
    isGroupTask () {
      return this.task.group.taskId || this.task.group.id;
    },
    taskCategory () {
      let taskCategory = 'default';
      if (this.isGroupTask) taskCategory = 'group';
      else if (this.isChallengeTask) taskCategory = 'challenge';
      return taskCategory;
    },
    showDelete () {
      return this.canDelete(this.task, this.taskCategory, this.isUser, this.group, this.challenge);
    },
    showEdit () {
      return this.canEdit(this.task, this.taskCategory, this.isUser, this.group, this.challenge);
    },
    showOptions () {
      return this.showEdit || this.showDelete || this.isUser;
    },
    teamManagerAccess () {
      if (!this.isGroupTask || !this.group) return true;
      if (!this.group.leader && !this.group.managers) return false;
      return (this.group.leader._id === this.user._id || this.group.managers[this.user._id]);
    },
    isOpenTask () {
      if (!this.isGroupTask) return false;
      if (this.task?.group?.assignedUsers?.length > 0) return false;
      return true;
    },
    showCheckIcon () {
      if (this.isGroupTask && this.task.group.assignedUsersDetail
        && this.task.group.assignedUsersDetail[this.user._id]) {
        return this.task.group.assignedUsersDetail[this.user._id].completed;
      }
      return this.task.completed;
    },
    showTaskLockIcon () {
      if (this.isUser) return false;
      if (this.isGroupTask) {
        if (this.task.completed) {
          if (this.task.group.assignedUsersDetail
            && this.task.group.assignedUsersDetail[this.user._id]
          ) {
            return false;
          }
          if (this.task.group.completedBy.userId === this.user._id) return false;
          if (this.teamManagerAccess) {
            if (!this.task.group.assignedUsers || this.task.group.assignedUsers.length === 0) {
              return false;
            }
            if (this.task.group.assignedUsers.length === 1) return false;
          }
          return true;
        }
        if (this.isOpenTask) return false;
        if (this.task.group.assignedUsersDetail[this.user._id]) {
          return false;
        }
      }
      return true;
    },
  },
  methods: {
    ...mapActions({
      scoreChecklistItem: 'tasks:scoreChecklistItem',
      collapseChecklist: 'tasks:collapseChecklist',
      destroyTask: 'tasks:destroy',
    }),
    toggleChecklistItem (item) {
      if (this.castingSpell) return;
      item.completed = !item.completed; // @TODO this should go into the action?
      this.scoreChecklistItem({ taskId: this.task._id, itemId: item.id });
    },
    calculateTimeTillDue () {
      const endOfToday = moment().subtract(this.user.preferences.dayStart, 'hours').endOf('day');
      const endOfDueDate = moment(this.task.date).endOf('day');

      return moment.duration(endOfDueDate.diff(endOfToday));
    },
    checkIfOverdue () {
      return this.calculateTimeTillDue().asDays() < 0;
    },
    formatDueDate () {
      if (moment().isSame(this.task.date, 'day')) {
        return this.$t('today');
      }
      return moment(this.task.date).format(this.user.preferences.dateFormat.toUpperCase());
    },
    edit (e, task) {
      if (this.isRunningYesterdailies) return;
      const target = e.target || e.srcElement;

      /*
       * Prevent clicking on a link from opening the edit modal
       *
       * Ascend up the ancestors of the click target, up until the node defining the click handler.
       * If any of them is an <a> element, don't open the edit task popup.
       * Needed in case of a link, with a bold and/or italic link description
       */
      for (let element = target; !element.classList.contains('task-clickable-area'); element = element.parentNode) {
        if (element.tagName === 'A') return; // clicked on a link
      }

      const isDropdown = this.$refs.taskDropdown && this.$refs.taskDropdown.$el.contains(target);
      const isEditAction = this.$refs.editTaskItem && this.$refs.editTaskItem.contains(target);

      if (isDropdown && !isEditAction) return;
      if (this.$store.state.spellOptions.castingSpell) return;

      if (!this.showEdit) {
        this.$emit('taskSummary', task);
      } else {
        this.$emit('editTask', task);
      }
    },
    moveToTop () {
      this.$emit('moveTo', this.task, 'top');
    },
    moveToBottom () {
      this.$emit('moveTo', this.task, 'bottom');
    },
    destroy () {
      const type = this.$t(this.task.type);
      if (!window.confirm(this.$t('sureDeleteType', { type }))) return; // eslint-disable-line no-alert
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
    },
    castEnd (e, task) {
      setTimeout(() => this.$root.$emit('castEnd', task, 'task', e), 0);
    },
    async score (direction) {
      if (this.showTaskLockIcon) return;
      if (this.task.type === 'habit' && !this.task[direction]) return;
      if (
        this.isGroupTask && direction === 'down'
        && ['todo', 'daily'].indexOf(this.task.type) !== -1
        && !((this.task.group.completedBy && this.task.group.completedBy.userId === this.user._id)
          || (this.task.group.assignedUsersDetail
            && this.task.group.assignedUsersDetail[this.user._id]))
      ) {
        this.$store.dispatch('tasks:needsWork', {
          taskId: this.task._id,
          userId: this.task.group.assignedUsers[0] || this.task.group.completedBy.userId,
        });
        this.task.completed = false;
        return;
      }
      if (this.isYesterdaily === true) {
        await this.beforeTaskScore(this.task);
        this.task.completed = !this.task.completed;
        this.playTaskScoreSound(this.task, direction);
      } else {
        this.taskScore(this.task, direction);
      }
    },
    handleBrokenTask (task) {
      if (this.$store.state.isRunningYesterdailies) return;
      this.$root.$emit('handle-broken-task', task);
    },
  },
};
</script>

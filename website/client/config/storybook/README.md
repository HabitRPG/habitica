# Storybook Updates

Addon-Knobs has been deprecated inorder to update to the new `addons-controls` we need to:

1. Change to the new export syntax for each story `export const StoryTemplate`
2. And use `StoryTemplate.args` and `StoryTemplate.argTypes` to have the same `knobs` as before

Maybe this can be made story by story and not all at once

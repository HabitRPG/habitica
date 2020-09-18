<template>
  <button title="close dialog">
    <svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- eslint-disable-next-line max-len -->
        <path d="M12.197 2L14 3.803 9.802 8 14 12.197 12.197 14 8 9.802 3.803 14 2 12.197 6.198 8 2 3.803 3.803 2 8 6.198z"
              id="9b5wgq873a"></path>
      </defs>
      <g fill="none" fill-rule="evenodd">
        <g>
          <g>
            <g transform="translate(-322 -70) translate(24 54) translate(298 16)">
              <mask fill="#fff" id="r1thx46wub">
                <use xlink:href="#9b5wgq873a"></use>
              </mask>
              <use fill="#878190" fill-rule="nonzero" xlink:href="#9b5wgq873a"></use>
              <g fill="#878190" mask="url(#r1thx46wub)">
                <path d="M0 0H16V16H0z"></path>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </button>
</template>

<script>
export default {
  name: 'closeIcon',
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  button {
    border: 0;
    outline: 0;
    padding: 0;
    background: transparent;

    svg path {
      fill: $gray-200;
    }

    &:hover {
      svg path {
        fill: $gray-100;
      }
    }
  }
</style>

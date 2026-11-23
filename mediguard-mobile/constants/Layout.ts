import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: { width, height },
  screenPadding: 20,
  cardBorderRadius: 28,
  pillBorderRadius: 9999,
  squircleBorderRadius: 18,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
};

import { isFriday, subDays } from "date-fns";

const mostRecentFriday = (): Date => {
  let today = new Date();
  while (!isFriday(today)) {
    today = subDays(today, 1);
  }
  return today;
};

export default mostRecentFriday;

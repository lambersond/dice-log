// Tracks how many portal-rendered popovers (Dropdowns, etc.) are currently
// open, so non-portal dismissers (e.g. the Modal backdrop) can ignore the
// click that the user actually intended for the dropdown.
let count = 0

export const popoverRegistry = {
  add() {
    count += 1
  },
  remove() {
    if (count > 0) count -= 1
  },
  size() {
    return count
  },
}

import { Select as SelectPrimitive } from 'bits-ui'

import Root from './select.svelte'
import Content from './select-content.svelte'
import Item from './select-item.svelte'
import Trigger from './select-trigger.svelte'

const Group = SelectPrimitive.Group
const GroupHeading = SelectPrimitive.GroupHeading

import Value from './select-value.svelte'

export {
  Root,
  Content,
  Item,
  Trigger,
  Value,
  Group,
  GroupHeading,
  //
  Root as Select,
  Content as SelectContent,
  Item as SelectItem,
  Trigger as SelectTrigger,
  Value as SelectValue,
  Group as SelectGroup,
  GroupHeading as SelectGroupHeading,
}

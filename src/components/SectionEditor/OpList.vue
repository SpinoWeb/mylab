<script setup lang="ts">
import { toRef, ref } from "vue";

import DataView from "primevue/dataview";

//import { Utils } from "../../libs/Utils";
//const u: any = new Utils();

const emit = defineEmits(["update:modelValue"]);

// const
/*
const hexToRgba = (hex: string, opacity: number = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: opacity,
      }
    : null;
};
*/

// props
interface Props {
  modelValue: any[] | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return [];
  },
});

//toRef
const items = toRef(props, "modelValue");

// ref
const op = ref();

// computed

// methods
const toggle = (event: any) => {
  op.value.toggle(event);
};

/*
const duplicateItem = (item: any) => {
  //console.log("OpList > duplicateItem", item);
  if (!item || !item.hasOwnProperty("id")) return;

  let newItem: any = u.clone(item);
  newItem.id = u.uuid();

  items.value.push(newItem);
};
*/

const deleteItem = (item: any) => {
  //console.log("OpList > deleteItem", item);
  if (!item || !item.hasOwnProperty("id")) return;

  const index: number = items.value.findIndex((i: any) => i.id === item.id);
  if (index > -1) items.value.splice(index, 1);

  // non lo elimina in data.value.Elements
  emit("update:modelValue", items.value);
};
</script>

<template>
  <Button
    icon="pi pi-list"
    raised
    v-tooltip.bottom="'List'"
    severity="secondary"
    @click="toggle"
  />

  <OverlayPanel ref="op"
    ><div class="card w-16rem">
      <DataView :value="items">
        <template #list="slotProps">
          <div
            class="grid grid-nogutter"
            v-for="(item, index) in slotProps.items"
            :key="index"
          >
            <div class="col">
              <div class="p-2">
                {{ item.name }}
              </div>
            </div>
            <div class="col-1">
              <div class="p-2">{{ Array.from(item.component)[0] }}</div>
            </div>
            <div class="col">
              <div class="p-0">
                <Button icon="pi pi-circle-fill" text rounded class="mr-1" />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  class="mr-1"
                  severity="secondary"
                  @click="deleteItem(item)"
                />
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
  </OverlayPanel>
</template>

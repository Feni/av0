<template>
    <ul class="list-group CellList">
        <template v-for="cell in cells">
            <template v-if="$store.state.editCell === cell">
                <label class="DataLabel">{{ cell.name }}</label>
                <Cell-Edit v-if="cell.isRootChild()" v-bind:cell="cell" :key="cell.id"></Cell-Edit>
                <Inline-Edit v-else v-bind:cell="cell" :key="cell.id"></Inline-Edit>
            </template>
            <Cell-View v-else v-bind:cell="cell" v-bind:embedded="embedded" :key="cell.id" />
        </template>
        <Add-Cell-Btn v-bind:group="this.addTo" v-if="!readonly && this.addTo"></Add-Cell-Btn>
    </ul>
</template>

<script lang="ts">
import Vue from "vue";
import {Group, Value} from "../engine/engine";

export default Vue.component('CellList', {
    name: 'CellList',
    props: {
        'cells': {type: Array},
        'addTo': {type: Group},
        'readonly': {type: Boolean, default: false},
        'embedded': {type: Boolean, default: false}
    }
});
</script>

<style>
</style>

<template>

<div>
    <span>
        <table class="table">
            <thead>
                <tr>
                    <th v-for="col in table.getColumns()" v-bind:key="col.id" scope="col">
                        <Column-Head v-bind:cell="col"></Column-Head>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in table.getRows()">
                    <td v-for="col in row">
                        <!-- <Result-View v-bind:value="col.evaluate()"></Result-View> -->
                        <Cell-View v-bind:cell="col"></Cell-View>
                    </td>
                </tr>
            </tbody>
        </table>
    </span>

</div>

<!--
    <ul class="list-group">
        <template v-for="cell in cells">
            <template v-if="cell.type == 'group'">
                <Cell-List :key="cell.id" v-bind:group="cell"></Cell-List>
            </template>
            <template v-else>
                <Cell-Edit v-if="$store.state.editCell === cell" :key="cell.id" v-bind:cell="cell"></Cell-Edit>
                <Cell-View v-else :key="cell.id" v-bind:cell="cell"></Cell-View>
            </template>
        </template>
    </ul>
    -->
</template>

<script lang="ts">
import Vue from "vue";
import {Table} from "../engine/engine";

export default Vue.component('CellTable', {
    name: 'CellTable',
    props: {
        'table': {type: Table},
    }
});
</script>

<style>
</style>

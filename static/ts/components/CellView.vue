<template>
    <div v-bind:class="classObject" data-id="cell.id" @click="select">
        <label class="DataLabel">{{ cell.name }}</label>
        <span class="DataValue">
            <!-- Auto-reflow to next line due to div -->

            <template v-if="!embedded">
                <template v-if="cell.type == 'group'">
                    <Group-View :key="cell.id" v-bind:group="cell" v-bind:readonly="readonly"></Group-View>
                </template>
                <template v-else-if="cell.type == 'table'">
                    <Cell-Table :key="cell.id" v-bind:table="cell" v-bind:readonly="readonly"></Cell-Table>
                </template>
                <template v-else-if="cell.type == 'func'">
                    <Function-View :key="cell.id" v-bind:func="cell"></Function-View>
                </template>
                <template v-else>
                    <template v-if="$store.state.editCell === cell">
                        <Cell-Edit v-if="cell.isRootChild()" v-bind:cell="cell" :key="cell.id"></Cell-Edit>
                        <Inline-Edit v-else v-bind:cell="cell" :key="cell.id"></Inline-Edit>
                    </template>
                    <template v-else>
                        <Result-View v-bind:cell="cell"/>
                    </template>
                </template>
            </template>
            <template v-else>
                <span>{{ cell.toString() }}</span>
            </template>

        </span>


        <Cell-Errors v-bind:cell="cell"></Cell-Errors>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Value} from "../engine/engine";
import * as constants from "../constants"

export default Vue.component('CellView', {
    name: 'CellView',
    props: {
        'cell': {type: Value},
        'readonly': {type: Boolean, default: false},
        'embedded': {type: Boolean, default: false}
    },
    data: () => {
        return {
            'constants': constants
        }
    },
    computed: {
        isLargeItem: function() : boolean {
            // TODO: Check if text is long or not
            if(this.cell.type === "object"){
                return true;
            } else if(this.cell.type === "text" && this.cell.expr.length > 100){
                return true;
            }
            try{
                return this.cell.toString().length > 50
            } catch { }
            return false;
            // return this.cell.toString().length > 50;
        },
        classObject: function() : object {
            // var typeClass = "DataType--" + this.cell.type;
            var typeClass = "DataType--" + this.cell._result_type;
            var cellClass = "CellType--" + this.cell.type;
            // this.index is relative within a group.
            let classes: {[index: string]: any} =  {
                "DataRow": true,
                "DataRow--large": this.isLargeItem,
                "list-group-item": true,
                "DataRow--root": this.cell.isRoot(),
                "DataRow--rootChild": this.cell.isRootChild()
            }
            classes[typeClass] = true;
            classes[cellClass] = true;
            return classes;
        },
    },
    methods: {
        select: function(event: Event) {
            console.log("Selecting ");
            console.log(event);
            console.log(this.cell.type);
            this.$store.commit("setEdit", this.cell);
            event.stopPropagation();
        }
    }
});
</script>

<style>
</style>
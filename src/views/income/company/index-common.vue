<template>
  <div>
    <a-list
      :data-source="headerData"
      :split="false">
      <div
        v-if="loadMore"
        slot="loadMore"
        :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }">
        <a-spin v-if="loadingMore"/>
        <a-button v-else @click="onLoadMore">
          加载更多
        </a-button>
      </div>
      <a-list-item
        slot="renderItem"
        slot-scope="item, index"
        :split="false"
        style="padding: 0;margin: 0;align-items: flex-start;">
        <div v-for="(col,i) in item" style="align-items: flex-start;">
          <a-table
            :columns="columns"
            :data-source="bodyData[index][i]"
            style="height: 100%"
            :scroll="{x : 200,y: 200}"
            bordered
            size="small"
            :rowKey='record=>record.id'
            :pagination="false">
            <a-tooltip slot="name" slot-scope="item" :title="col.name" trigger="hover">
              <span style="font-family: Arial,serif;height: fit-content">{{ col.name }}</span>
            </a-tooltip>
            <span slot="money" slot-scope="item" style="font-family: Arial,serif">
              <a-row>
                <a-col :span="22">
                  {{ col.money }}
                </a-col>
                <a-col :span="2">
                  <a-button
                    shape="circle"
                    icon="plus"
                    size="small"
                    @click="addChildRow(item,index,i)"
                  />
                </a-col>
              </a-row>
            </span>
            <template slot="nameCell" slot-scope="text, record">
              <editable-cell :text="text" @change="onCellChange(record, 'name', $event)"/>
            </template>
            <template slot="moneyCell" slot-scope="text, record">
              <editable-cell :text="text" @change="onCellChange(record, 'money', $event)"/>
            </template>
          </a-table>
        </div>
        <a-table
          :columns="actionColumns"
          size="small"
          style="width: 100%;height: 50%"
          :pagination="false">
          <span slot="action" slot-scope="text, record">
              <a>Invite 一 {{ record.$index }}</a>
          </span>
        </a-table>
      </a-list-item>
    </a-list>
  </div>
  <!--  </div>-->
</template>
<script>
const EditableCell = {
  template: `
    <div class="editable-cell" @mouseleave="check">
    <div v-if="editable" class="editable-cell-input-wrapper" @blur="check">
      <a-input :value="value" @change="handleChange" @pressEnter="check" @blur="check"/>
    </div>
    <div v-else class="editable-cell-text-wrapper" @mousedown="edit">
      {{ value || ' ' }}
      <a-icon type="edit" class="editable-cell-icon"/>
    </div>
    </div>
  `,
  props: {
    text: [String, Number],
  },
  data() {
    return {
      value: this.text,
      editable: false,
    };
  },
  methods: {
    handleChange(e) {
      this.value = e.target.value.toString();
    },
    check() {
      this.editable = false;
      console.log(this.value)
      this.$emit('change', this.value);
    },
    edit() {
      this.editable = true;
    },
  },
};

const columns = [
  {
    dataIndex: 'name',
    key: 'name',
    slots: {title: 'customTitle'},
    scopedSlots: {title: 'name', customRender: 'nameCell'},
    ellipsis: true,
  },
  {
    dataIndex: 'money',
    key: 'money',
    slots: {title: 'customMoney'},
    scopedSlots: {title: 'money', customRender: 'moneyCell'},
  }
];


const actionColumns = [
  {
    dataIndex: 'action',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  }
];

const listData = [
  {
    rowData: [
      {
        header: {
          name: "a",
          money: 1234.0
        },
        data: [
          {
            id: 1,
            name: "a1",
            money: 1234.0
          },
          {
            id: 2,
            name: "a2",
            money: 1234.0
          },
          {
            id: 3,
            name: "a2",
            money: 1234.0
          }
        ]
      },
      {
        header: {
          name: "大同芳华有限公司",
          money: 1234.0
        },
        data: [
          {
            id: 1,
            name: "a1",
            money: 1234.0
          },
          {
            id: 2,
            name: "a2",
            money: 1234.0
          },
          {
            id: 3,
            name: "a2",
            money: 1234.0
          },
          {
            id: 4,
            name: "a2",
            money: 1234.0
          }
        ]
      },
      {
        header: {
          name: "a",
          money: 1234.0
        },
        data: [
          {
            id: 1,
            name: "a1",
            money: 1234.0
          },
          {
            id: 2,
            name: "a2",
            money: 1234.0
          }
        ]
      }
    ]
  },
  {
    rowData: [
      {
        header: {
          name: "a",
          money: 1234.0
        },
        data: [
          {
            name: "a1",
            money: 1234.0
          },
          {
            name: "a2",
            money: 1234.0
          }
        ]
      },

      {
        header: {
          name: "a",
          money: 1234.0
        },
        data: [
          {
            name: "a1",
            money: 1234.0
          },
          {
            name: "a2",
            money: 1234.0
          }
        ]
      },

      {
        header: {
          name: "a",
          money: 1234.0
        },
        data: [
          {
            name: "a1",
            money: 1234.0
          },
          {
            name: "a2",
            money: 1234.0
          }
        ]
      }
    ]
  }
];
const headerData = [
  [
    {
      name: "a",
      money: 1234.0
    },
    {
      name: "b",
      money: 1234.0
    },
    {
      name: "c",
      money: 1234.0
    }
  ],
  [
    {
      name: "d",
      money: 1234.0
    },
    {
      name: "e",
      money: 1234.0
    },
    {
      name: "f",
      money: 1234.0
    }
  ]
];

const bodyData = [[[
  {
    id: 1,
    name: "a1",
    money: 1234.0
  },
  {
    id: 2,
    name: "a2",
    money: 1234.0
  },
  {
    id: 3,
    name: "a2",
    money: 1234.0
  }
],
  [{
    id: 1,
    name: "a1",
    money: 1234.0
  },
    {
      id: 2,
      name: "a2",
      money: 1234.0
    },
    {
      id: 3,
      name: "a2",
      money: 1234.0
    },
    {
      id: 4,
      name: "a2",
      money: 1234.0
    }], [
    {
      id: 1,
      name: "a1",
      money: 1234.0
    },
    {
      id: 2,
      name: "a2",
      money: 1234.0
    }
  ]],
  [[{
    id: 1,
    name: "a2",
    money: 1234.0
  },
  {
    id: 2,
    name: "a2",
    money: 1234.0
  }],
  [{
    id: 1,
    name: "a2",
    money: 1234.0
  },
  {
    id: 2,
    name: "a2",
    money: 1234.0
  }],
  [{
    id: 1,
    name: "a2",
    money: 1234.0
  },
  {
    id: 2,
    name: "a2",
    money: 1234.0
  }]
]
];

export default {
  components: {
    EditableCell,
  },
  data() {
    return {
      totalCount: 0,
      columns,
      //是否在加载中
      loadingMore: false,
      //是否有数据可以加载
      loadMore: true,
      actionColumns,
      listData,
      headerData,
      bodyData,
      busy: false
    };
  },
  methods: {
    onLoadMore() {
      this.busy = true;

      this.busy = false;
    },
    onCellChange(record, dataIndex, value) {
      console.log(record.key, dataIndex, value)
    },
    getRowKey(record) {
      console.log(record)
      return record.id;
    },
    addChildRow(item, listRowIndex,tableIndex) {
      console.log(item,listRowIndex,tableIndex)
      if (bodyData[listRowIndex][tableIndex] == null) {
        bodyData[listRowIndex][tableIndex] = []
      }
      bodyData[listRowIndex][tableIndex].push(
        {
          id: 2,
          name: "a2",
          money: 1234.0
        }
      )
    }
  }
};
</script>
<style>
.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>

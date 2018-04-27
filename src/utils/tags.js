import React from 'react';
import { Tag } from 'antd';
import subString from './subString'

function tags(record) {
    let tag;
    if (record.tags) {
        if (record.tags.length > 2) {
            tag = record.tags.slice(0, 2).map((item, i) => {
                return <Tag key={i} style={{ float:'left' }} title={item.tagName}>{subString(item.tagName)}</Tag>
            })
        } else {
            tag = record.tags.map((item, i) => {
                return <Tag key={i} style={{ float:'left' }} title={item.tagName}>{subString(item.tagName)}</Tag>
            })
        }
        tag.push(<span key="span" className={record.tags.length > 2 ? "" : "hidden"}>...</span>)
        return <div>{tag}</div>
    }
}
export default tags;

import React, { Fragment, useEffect, useState, useRef } from 'react'
import { Table, Divider, Input, Button, Space, notification, Popconfirm} from 'antd';
import './index.css'
import axios from 'axios';

export default function Index() {
    const { Column } = Table

    const nameRef = useRef("")
    const codeRef = useRef("")
    const districtRef = useRef("")
    const populationRef = useRef("")

    //组件mount标识位
    const mountFlag = useRef(true)

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    // 组件update标识位
    const [updateFlag, setUpdateFlag] = useState(false)
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, pageSizeOptions: [5, 10, 20, 50] })

    useEffect(() => {
        if(mountFlag.current) {
            getAllCities()
            mountFlag.current = false
            return
        }
        getAllCities()
        console.log('@');
    },[updateFlag])// eslint-disable-line

    const getAllCities = () => {
        axios.get('/cites').then(
            (response) => {
                setData(response.data)
                setPagination({ ...pagination, total: response.data.length })
            }
        )
    }

    //发送分页请求
    const handlePagination = (p) => {
        axios.get(`/cites/${p.current}/${p.pageSize}`).then(
            (response) => {
                setData(response.data)
                setPagination({
                    ...pagination,
                    current: p.current,
                    pageSize: p.pageSize,
                    total: p.total
                })
            }
        )
    }

    const deleteRow = (record) => {
        axios.delete(`/cites/${record.id}`).then(
            (response) => {
                if (response.data === 'success') {
                    setUpdateFlag(!updateFlag)
                    notification.success({
                        message: '数据删除成功',
                        duration: 2,
                        placement: 'topRight',
                        description: ''
                    })
                } else {
                    notification.error({
                        message: '数据删除失败',
                        duration: 2,
                        placement: 'topRight',
                        description: '请联系管理员'
                    })
                }
            }
        )
    }

    // 新增城市
    const addCity = () => {
        axios.post('/cites', {
            name: nameRef.current.input.value,
            countryCode: codeRef.current.input.value,
            district: districtRef.current.input.value,
            population: populationRef.current.input.value
        }).then(
            (response) => {
                const { cityInfo, oprInfo } = response.data
                if (oprInfo === 1) {
                    setUpdateFlag(!updateFlag)
                    notification.success({
                        message: '数据添加成功',
                        duration: 2,
                        placement: 'topRight',
                        description: `城市名称：${cityInfo.name}`
                    })
                } else {
                    notification.error({
                        message: '数据添加失败',
                        duration: 2,
                        placement: 'topRight',
                        description: '请联系管理员'
                    })
                }
            }
        )
    }

    return (
        <Fragment>
            <Divider orientation='left'>
                城市管理
            </Divider>
            <div id="btns">
                <Input placeholder='Name' ref={nameRef} />
                <Input placeholder='CountryCode' ref={codeRef} />
                <Input placeholder='District' ref={districtRef} />
                <Input placeholder='Population' ref={populationRef} />
                <Button type='primary'>Find</Button>
                <Button type='primary' onClick={addCity}>Add</Button>
            </div>
            <Table className='my-table' bordered rowKey={(data) => data.id}
                dataSource={data} pagination={pagination} onChange={handlePagination}>
                <Column title='Name' dataIndex='name' key='name' />
                <Column title='CountryCode' dataIndex='countryCode' key='countryCode' />
                <Column title='District' dataIndex='district' key='district' />
                <Column title='Population' dataIndex='population' key='population' />
                <Column title='Action' key='population' render={
                    (record) => (
                        <Space size="middle">
                            <Button type='primary' onClick={() => { handleRow(record) }}>Edit</Button>
                            <Popconfirm title='确定删除吗?' okText='确定' cancelText="取消" onConfirm={() => { deleteRow(record)}}>
                                <Button type='danger'>Delete</Button>
                            </Popconfirm>
                        </Space>
                    )
                } />
            </Table>
        </Fragment>
    )

}

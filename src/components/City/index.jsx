import React, { Fragment, useEffect, useState, useRef } from 'react'
import { Table, Divider, Input, Button, Space, notification, Popconfirm } from 'antd';
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
    // 组件update标识位
    const [updateFlag, setUpdateFlag] = useState(false)
    const [data, setData] = useState([])
    const [updateData, setUpdateData] = useState({})
    // const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, pageSizeOptions: [5, 10, 20, 50] })

    useEffect(() => {
        if (mountFlag.current) {
            getAllCities()
            mountFlag.current = false
            return
        }
        getAllCities()
    }, [updateFlag])// eslint-disable-line

    const getAllCities = () => {
        axios.get('/cities').then(
            (response) => {
                setData(response.data)
                setPagination({ ...pagination, total: response.data.length })
            }
        )
    }

    //发送分页请求
    const handlePagination = (p) => {
        axios.get(`/cities/${p.current}/${p.pageSize}`).then(
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
        axios.delete(`/cities/${record.id}`).then(
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
        axios.post('/cities', {
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

    const updateRow = (record) => {
        setUpdateData({
            id: record.id,
            name: record.name,
            countryCode: record.countryCode,
            district: record.district,
            population: record.population,
        })
    }

    const updateCity = () => {
        axios.put('/cities', {uData: updateData}).then(
            (response) => {
                if(response.data === 1) {
                    setUpdateFlag(!updateFlag)
                    setUpdateData({})
                    notification.success({
                        message: '数据更新成功',
                        duration: 2,
                        placement: 'topRight',
                        description: `城市名称：${updateData.name}`
                    })
                }
            }
        )
    }

    const findCities = () => {
        axios.get(
            '/cities',
            {
                params: {
                    name: nameRef.current.input.value,
                    countryCode: codeRef.current.input.value,
                    district: districtRef.current.input.value,
                    population: populationRef.current.input.value
                }
            }
        ).then(
            (response) => {
                // setUpdateFlag(!updateFlag)
                setData(response.data)
                setPagination({ ...pagination, total: response.data.length })
            }
        )
    }

    const changeInputValue = (e) => {
        setUpdateData({...updateData, [e.target.id]: e.target.value})
    }


    return (
        <Fragment>
            <Divider orientation='left'>
                城市管理
            </Divider>
            <div id="btns">
                <Input id='name' placeholder='Name' ref={nameRef} value={updateData.name} onChange={(e) => { changeInputValue(e) }}/>
                <Input id='countryCode' placeholder='CountryCode' ref={codeRef} value={updateData.countryCode} onChange={(e) => { changeInputValue(e) }}/>
                <Input id='district' placeholder='District' ref={districtRef} value={updateData.district} onChange={(e) => { changeInputValue(e) }}/>
                <Input id='population' placeholder='Population' ref={populationRef} value={updateData.population} onChange={(e) => { changeInputValue(e) }}/>
                <Button type='primary' onClick={addCity}>Add</Button>
                <Button type='primary' onClick={updateCity}>Update</Button>
                <Button type='primary' onClick={findCities}>Find</Button>
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
                            <Button type='primary' onClick={() => { updateRow(record) }}>Edit</Button>
                            <Popconfirm title='确定删除吗?' okText='确定' cancelText="取消" onConfirm={() => { deleteRow(record) }}>
                                <Button type='danger'>Delete</Button>
                            </Popconfirm>
                        </Space>
                    )
                } />
            </Table>
        </Fragment>
    )
}

/**
 *  提供添加／编辑地址的表单
 */
import React from 'react';
import { Form, Input, Cascader, InputNumber } from 'antd';

const FormItem = Form.Item;

const addressOptions = [{
  value: '中国',
  label: '中国',
  children: [
    {
      value: '浙江',
      label: '浙江',
      children: [{
        value: '杭州',
        label: '杭州',
        children: [{
          value: '西湖区',
          label: '西湖区',
        }],
      }],
    }, {
      value: '江苏',
      label: '江苏',
      children: [{
        value: '南京',
        label: '南京',
        children: [{
          value: '中华门',
          label: '中华门',
        }, {
          value: '梦幻岛',
          label: '梦幻岛',
        }],
      }],
    },
  ] },
];

class AddressForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: {
        address: '',
        country: '',
        province: '',
        city: '',
        district: '',
        county: '',
        customer: '',
        display_order: 1,
        latitude: '',
        longitude: '',
        name: '',
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    const newValue = {
      ...value,
      ...this.state.value,
    };
    this.setState({
      value: newValue,
    });
  }

  onAddressSelectorChange(cascadeArray) {
    const newValue = {
      country: cascadeArray[0] || '',
      province: cascadeArray[1] || '',
      city: cascadeArray[2] || '',
      district: cascadeArray[3] || '',
    };
    this.props.form.setFieldsValue(newValue);
  }

  render() {
    const form = this.props.form;
    const { getFieldDecorator } = form;
    const { address, country, province, city, district, county, customer, latitude, longitude, name } = this.state.value;
    return (
      <div>
        <Form key="address-form" layout="horizontal">
          <FormItem
            label="地址名称"
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '地址名称',
              }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label="国家／省／市／区、县"
          >
            <Cascader options={addressOptions} onChange={this.onAddressSelectorChange.bind(this)} />
          </FormItem>
          <FormItem
            label="国家"
          >
            {getFieldDecorator('country', {
              rules: [{
                required: true, message: '请选择国家',
              }],
            })(
              <Input hidden />,
            )}
          </FormItem>
          <FormItem
            label="省"
          >
            {getFieldDecorator('province', {
              rules: [{
                required: true, message: '请选择省',
              }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label="省"
          >
            {getFieldDecorator('city', {
              rules: [{
                required: true, message: '请选择城市',
              }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label="省"
          >
            {getFieldDecorator('district', {
              rules: [{
                required: true, message: '请选择区县',
              }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label="地址"
          >
            {getFieldDecorator('address', {
              rules: [{
                required: true, message: '请输入地址',
              }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            label="显示顺序"
          >
            {getFieldDecorator('display_order', {
              rules: [{
                required: true, message: '请输入顺序',
              }],
            })(
              <InputNumber min={1} max={10} />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(AddressForm);

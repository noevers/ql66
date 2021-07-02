import React, { useEffect, useState, useRef } from 'react';
import { Modal, message, Switch } from 'antd';
import QRCode from 'qrcode.react';
import { request } from '@/utils/http';
import config from '@/utils/config';

const QRModal = ({
  handleCancel,
  okText = '确定添加',
  visible,
}: {
  visible: boolean;
  okText: string;
  handleCancel: (cks?: any[]) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [autoAdd, setAutoAdd] = useState(true);
  const [qrUrl, setQrUrl] = useState('');
  const [cookie, setCookie] = useState('');
  const timerRef = useRef();

  const getQRUrl = async () => {
    const method = 'get';
    const { code, data } = await request[method](
      `${config.apiPrefix}qrcode`,
      {},
    );
    if (code === 200) {
      setQrUrl(data);
      setShow(false);
      checkLogin();
    } else {
      message.error(data);
    }
  };
  const checkLogin = async () => {
    const timeId = setInterval(async () => {
      const method = 'get';
      const { err, cookie } = await request[method](
        `${config.apiPrefix}status`,
        {},
      );
      if (err === 0) {
        setCookie(cookie);
        clearInterval(timeId);
        console.log('---------cookie-----', cookie);
      } else if (err == 21) {
        clearInterval(timeId);
        //重新刷新 二维吗
        setShow(true);
      }
    }, 3000);
    timerRef.current = timeId;
  };

  const copyToClip = (content: string) => {
    var aux = document.createElement('input');
    aux.setAttribute('value', content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand('copy');
    document.body.removeChild(aux);
    message.success('Cookie 已复制到剪切板');
  };
  useEffect(() => {
    getQRUrl();
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  useEffect(() => {
    if (cookie && okText !== '复制到剪贴板' && autoAdd) {
      message.success('正在自动添加 Cookie,并关闭弹窗');
      setTimeout(handleOk, 1000);
    }
  }, [cookie]);

  const handleOk = async () => {
    if (!cookie) {
      return message.error('请扫码登录获取到 Cookie 后再试');
    }
    if (okText === '复制到剪贴板') {
      copyToClip(cookie);
      handleCancel();
    } else {
      setLoading(true);
      const method = 'post';
      const payload = [cookie];
      const { code, data } = await request[method](
        `${config.apiPrefix}cookies`,
        {
          data: payload,
        },
      );
      if (code === 200) {
        message.success('添加Cookie成功');
      } else {
        message.error(data);
      }
      setLoading(false);
      handleCancel(data);
    }
  };

  return (
    <Modal
      title={'扫码添加Cookie'}
      visible={visible}
      forceRender
      okText={okText}
      onOk={() => handleOk()}
      onCancel={() => handleCancel()}
      confirmLoading={loading}
      destroyOnClose
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 20, fontSize: 14 }}>
          使用京东 App 扫码登录获取 Cookie
        </div>
        <div
          style={{
            height: 200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <QRCode value={qrUrl} size={200} fgColor="#000000" />
          {show && (
            <div
              onClick={() => {
                getQRUrl();
              }}
              style={{
                position: 'absolute',
                height: 200,
                width: 200,
                backgroundColor: 'rgba(0,0,0,.65)',
                color: 'red',
                fontSize: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              二维码已过期,点击重新刷新二维码
            </div>
          )}
          {cookie && (
            <div
              style={{
                position: 'absolute',
                height: 200,
                width: 200,
                backgroundColor: 'rgba(0,0,0,.85)',
                color: 'red',
                fontSize: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              京东账号登录成功
            </div>
          )}
        </div>
        {cookie && (
          <div
            style={{
              width: 400,
              marginTop: 20,
              backgroundColor: 'aliceblue',
              padding: 8,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              copyToClip(cookie);
            }}
          >
            {cookie}
          </div>
        )}
        {okText !== '复制到剪贴板' && (
          <div style={{ marginTop: 20, fontSize: 16 }}>
            <Switch
              checked={autoAdd}
              checkedChildren={'自动添加 Cookie,并关闭弹窗'}
              unCheckedChildren={'手动添加 Cookie,后关闭弹窗'}
              onChange={(e) => {
                setAutoAdd(e);
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRModal;

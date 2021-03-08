<?php

function getReqSign($params /* 关联数组 */, $appkey /* 字符串*/)
{
    // 1. 字典升序排序
    ksort($params);

    // 2. 拼按URL键值对
    $str = '';
    foreach ($params as $key => $value)
    {
        if ($value !== '')
        {
            $str .= $key . '=' . urlencode($value) . '&';
        }
    }

    // 3. 拼接app_key
    $str .= 'app_key=' . $appkey;
    var_dump($str);
    // 4. MD5运算+转换大写，得到请求签名
    $sign = strtoupper(md5($str));
    return $sign;
}

$appkey = 'ZKHU1KDsGQD15zgb';
$params = array(
    'app_id'     => '2167071591',
    'time_stamp' => time(),
    'nonce_str'  => '20e3408a79',
    'session'    => '3303928580',
    'question'   => '你好呀',
    'sign'       => ''
);
$params['sign'] = getReqSign($params, $appkey);

var_dump($params);
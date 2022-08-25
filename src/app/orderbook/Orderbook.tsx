import throttle from 'lodash/throttle';
import React, { useEffect, useState } from 'react';
import './orderbook.css';
import { XBTGroup, ETHGroup } from './constant';
const p_ws = new WebSocket('wss://www.cryptofacilities.com/ws/v1');

export default function Orderbook() {
  const [ws, setWS] = useState(null);
  const [event, setEvent] = useState('subscribe');
  const [pid, setPID] = useState('PI_XBTUSD');
  const [killFeed, setKillFeed] = useState(false);
  const [wsMsg, setWsMsg] = useState(null);
  const [buylist, setBuyList] = useState([]);
  const [selllist, setSellList] = useState([]);
  const [groupingValue, setGroupingValue] = useState(0.5);

  const onChangeGroup = (e: any) => {
    setGroupingValue(e.target.value);
  };

  const toogleFeed = () => {
    setEvent('unsubscribe');
    p_ws.send(JSON.stringify({ event: 'unsubscribe', feed: 'book_ui_1', product_ids: [pid] }));
    if (pid === 'PI_XBTUSD') {
      setPID('PI_ETHUSD');
      setGroupingValue(ETHGroup[0]);
    }
    if (pid === 'PI_ETHUSD') {
      setPID('PI_XBTUSD');
      setGroupingValue(XBTGroup[0]);
    }
    setBuyList([]);
    setSellList([]);
  };

  const onKillFeed = () => {
    setKillFeed(!killFeed);
    setWS(null);
  };

  const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getTotal = (list: any, index: number) => {
    let sum = 0;
    for (let i = 0; i <= index; i++) {
      const item = list[i];
      sum += item[1];
    }
    return sum;
  };
  useEffect(() => {
    if (ws == null) {
      p_ws.onopen = function () {
        p_ws.send(JSON.stringify({ event: event, feed: 'book_ui_1', product_ids: [pid] }));
      };
      p_ws.onmessage = throttle(
        (msg) => {
          setWsMsg(msg);
        },
        1,
        { leading: true }
      );
      setWS(p_ws);
    }
  }, []);

  useEffect(() => {
    if (wsMsg && !killFeed) {
      const data = JSON.parse(wsMsg.data);
      let tempBuylist = [...buylist];
      const tempBuyidlist = tempBuylist.map((item: any) => item[0]);
      data.bids &&
        data.bids.forEach((item: any) => {
          const i = tempBuyidlist.indexOf(item[0]);
          if (i >= 0) {
            tempBuylist[i] = item;
          } else {
            tempBuylist.push(item);
          }
        });
      tempBuylist = tempBuylist && tempBuylist.filter((item: any) => item[1] !== 0);
      tempBuylist.sort(function (a, b) {
        return b[0] - a[0];
      });
      setBuyList(tempBuylist);
      let tempSelllist = [...selllist];
      const tempSellidlist = tempSelllist.map((item: any) => item[0]);
      data.asks &&
        data.asks.forEach((item: any) => {
          const i = tempSellidlist.indexOf(item[0]);
          if (i >= 0) {
            tempSelllist[i] = item;
          } else {
            tempSelllist.push(item);
          }
        });
      tempSelllist = tempSelllist && tempSelllist.filter((item: any) => item[1] !== 0);
      tempSelllist.sort(function (a, b) {
        return a[0] - b[0];
      });
      setSellList(tempSelllist);
      if (data.numLevels) {
        p_ws.onmessage = throttle(
          (msg) => {
            setWsMsg(msg);
          },
          200,
          { leading: true }
        );
        setWS(p_ws);
      }
    }
  }, [wsMsg]);

  useEffect(() => {
    if (event === 'unsubscribe') {
      p_ws.send(JSON.stringify({ event: 'subscribe', feed: 'book_ui_1', product_ids: [pid] }));
      setEvent('subscribe');
    }
  }, [event]);

  const buyList = [];
  const askList = [];
  let displayBuyList: any[] | (string | number)[][] = [];
  buylist.forEach((item: any) => {
    const last = displayBuyList.length - 1;
    if (last >= 0 && item[0] !== displayBuyList[last][0] && displayBuyList[last][0] - item[0] < groupingValue) {
      displayBuyList[last][1] += item[1];
    } else {
      displayBuyList.push({ ...item });
    }
  });
  displayBuyList = displayBuyList.slice(0, 15);
  let displaySellList: any[] | (string | number)[][] = [];
  selllist.forEach((item: any) => {
    const last = displaySellList.length - 1;
    if (last >= 0 && item[0] !== displaySellList[last][0] && item[0] - displaySellList[last][0] < groupingValue) {
      displaySellList[last][1] += item[1];
    } else {
      displaySellList.push({ ...item });
    }
  });
  displaySellList = displaySellList.slice(0, 15);

  if (displayBuyList) {
    for (let i = 0; i < displayBuyList.length; i++) {
      const item = displayBuyList[i];
      const graphPercent = (getTotal(displayBuyList, i) / item[0]) * 100;
      buyList.push(
        <div className="row buy-row" key={`buyer-${i}`}>
          <div className="col price">{numberWithCommas(item[0])}</div>
          <div className="col">{numberWithCommas(item[1])}</div>
          <div className="col">{numberWithCommas(getTotal(displayBuyList, i))}</div>
          <div className="graph" style={{ width: `${graphPercent}%` }} />
        </div>
      );
    }
  }
  if (displaySellList) {
    for (let i = 0; i < displaySellList.length; i++) {
      const item = displaySellList[i];
      const graphPercent = (getTotal(displaySellList, i) / item[0]) * 100;
      askList.push(
        <div className="row sell-row" key={`seller-${i}`}>
          <div className="col price">{numberWithCommas(item[0])}</div>
          <div className="col">{numberWithCommas(item[1])}</div>
          <div className="col">{numberWithCommas(getTotal(displaySellList, i))}</div>
          <div className="graph" style={{ width: `${graphPercent}%` }} />
        </div>
      );
    }
  }
  return (
    <>
      <header className="app-header">
        <span>Order Book</span>
        <div className="select-section">
          Group
          <select onChange={onChangeGroup}>
            {pid === 'PI_XBTUSD' && XBTGroup.map((item) => <option key={`XBT-${item}`}>{item}</option>)}
            {pid === 'PI_ETHUSD' && ETHGroup.map((item) => <option key={`XBT-${item}`}>{item}</option>)}
          </select>
        </div>
      </header>
      <div className="orderbook-container">
        <div className="container-fluid">
          <div className="row orderbook-header py-1">
            <div className="col-12 col-md-6 px-5">
              <div className="row buy-header">
                <div className="col">PRICE</div>
                <div className="col">SIZE</div>
                <div className="col">TOTAL</div>
              </div>
            </div>
            <div className="col-12 col-md-6 px-5 d-none d-md-block">
              <div className="row sell-header">
                <div className="col">PRICE</div>
                <div className="col">SIZE</div>
                <div className="col">TOTAL</div>
              </div>
            </div>
          </div>
          <div className="row orderbook-body py-1">
            <div className="col-12 col-md-6 buy-list">{buyList}</div>
            <div className="col-12 col-md-6 ask-list">{askList}</div>
          </div>
        </div>
      </div>
      <footer className="app-footer">
        <a className="btn btn-primary mx-1" onClick={toogleFeed}>
          Toggle Feed
        </a>
        <a className="btn btn-danger mx-1" onClick={onKillFeed}>
          Kill Feed
        </a>
      </footer>
    </>
  );
}

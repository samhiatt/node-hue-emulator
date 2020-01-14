# Alexa2MQTT

[![NPM version](https://badge.fury.io/js/alexa2mqtt.svg)](http://badge.fury.io/js/alexa2mqtt)
[![Dependency Status](https://img.shields.io/gemnasium/krambox/alexa2mqtt.svg?maxAge=2592000)](https://gemnasium.com/github.com/krambox/alexa2mqtt)
[![Build Status](https://travis-ci.org/krambox/alexa2mqtt.svg?branch=master)](https://travis-ci.org/krambox/alexa2mqtt)
[![Maintainability](https://api.codeclimate.com/v1/badges/323bbf948a25557a2406/maintainability)](https://codeclimate.com/github/krambox/alexa2mqtt/maintainability)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Written and (C) 2015-17 Kai Kramer, based on an idea and code from Sam Hiatt (https://github.com/samhiatt/node-hue-emulator).
Build with https://github.com/hobbyquaker/xyz2mqtt-skeleton from Sebastian Raff.

Provided under the terms of the MIT license.


NodeJs Hue emulator, with UPnP discovery that works with Amazon Echo

Allows Amazon Echo to communicate with arbitrary http services using the Hue API. 

Derrived from http://github.com/armzilla/amazon-echo-ha-bridge

## Config

```
alexa:
  - name: Licht
    id: "1"
    switch:
      topic: lox/set/arbeitszimmer/beleuchtung/arbeitszimmer
      on: on
      off: off
    control:
      topic: lox/set/arbeitszimmer/beleuchtung/arbeitszimmer
    color:
      topic: lox/set/arbeitszimmer/beleuchtung/arbeitszimmer
```

## Build and run local Docker container

In Progress - not working at Mac and Synology (upnp discovery problem)

    docker build -t alexa2mqtt . && docker run --env-file ./alexa2mqtt.env -p 1900:1900 -p 8082:8082 -v /Volumes/data/smarthome/:/data -it alexa2mqtt 

    docker run --env-file /volume1/data/smarthome/alexa.env -p 1900:1900 -p 8082:8082 -v /volume1/data/smarthome/:/data -it alexa2mqtt

##  Alexa Config

https://alexa.amazon.de/spa/index.html#appliances

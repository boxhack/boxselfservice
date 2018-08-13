var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';
//env = process.env.NODE_ENV || 'production';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'eedevweb'
    },
    port: process.env.PORT || 3000,
    env: 'dev',
    dburl: 'https://eedevdb.documents.azure.com:443/',
    dbmasterkey: 'drsuY6OxXyHVVtdlg3YwPBEftWD3ZtMNmIFU1PRAtRoJ7ueuPww6GNDT9d8EhSfwSoijgxew3ojFQrCyxTpeCw==',


    // ----------- below from default.json downloaded -----------------------------------------------------
    "clientID": "5yuu61wpv1rliwz9vs2fg68b2tukggi6",
    "clientSecret": "Bw2D2SX3C58ulZNaQTc5dlliN8EiVJdJ",
    "publicKeyID": "mzi1i8tx",
    "privateKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQI5Sg/tvAgz+UCAggA\nMBQGCCqGSIb3DQMHBAhMvJlZbjYLEQSCBMg5inJJ3wU+nxSBzaA4lZT79SojtDOl\nxg1IBE/xmiLE4GB3fgpf5kBIM8dRlOgeaDeNDlVuEGmPAtVo4WqECZ1oRHD6aFtG\nGVRLd85OpVOQPRq7xtceuRWXg/hWJukvlqGlV+tJHB8t14gHrXQr2pQ9FaxdA0x9\nE0a7GFXOeUwyrikiUyTXLNdNNOXN7+T7zJf5nBnUeaZu9tUynJlX/r2vz0U92V5r\n4+HRnkQcBNu/HYfhpyA2WG+68qL1HFd+wQFRNt0PpBLYPwhE2d3Y2uDkXA2ShB5I\nO3E/M9OOHF4/zfSlFX6SYlxNAWDuFYT9g26EruI9hSI6S92M1dVJ1F/m5dXJIY8s\nGDgeNqCNGM5QeACzeaH1BIL/jONTdRclt6CdG96HZDUuQ6qW3xiERfz0R5VLQH7l\nLoxOUjSRwLyAb0y+hnkKzc9rNStRLvdiBpoSpyr5YGnKUg8HDAYOLBVgNYI4UWkq\nQ5zGeKUgjtiZcKcRG+ySh2ywqkLzjffy0BuzLNSI4Dmddwkn9sa14uhZV7x8bP/T\niMmOOPBQMEG3vpaWStrarYjDOvzJL/qNzfN2J4OBumEwgBN3sMXjH26n6jYA4kt1\nTmKUHlOZnuUJaJ6W7d6VHtPoh5hjn19VTHqNxICmhUyxiLClGR+9TCqyQ8n9CJg1\nEMR4ocDqQm6x1a1AW5fxwkCoIEOhP/qvhbhVKCRo33HuSTzUcESsAyCFiHbHzj4Q\nySxmyO3JU/oGazUys7BlXs6wtYHCTcAhEPaVuXoI/M59/mB80etxDncgMcdMd/VC\nwwOajZjIYIQ0XL0y5PNdFN1KJoqOomVJeYJT39utDdOhdCfEkr/l6TH+yYElz172\nBnL5dp5/qhgQwChtjoYXGjdtoaILnFxun58IgNogKc5dlZuGJvoiHCWiBMOmoe5/\ntbcVepNoITTuNNfy2bdUMzwkEW6mE01fIwZDO8nyjAoEJ8I26WmMAeuSsaZcSKS3\nmQvGUNVIz4YwSwusFmO6D8FN1SjF/KPGhg0RnhhaiIg8+VDZdjot1YYJk1nP9KYj\nLt4qu7Iuow2ewgegremdEmXqslW7ES3NwxbCxEWKoGA/qFy94BtO+44rwqpLmiSu\n800sBY5yeNepKyBqQdora2iGrBJ0+0fVJvaQ+qsayUCG5deBpgPqaZww6uke/j0u\nSQud+auQEe6IYo2PNSbOsIXjDJn6BxkZwg/HbMxpm1MpOBGf7UrhAobwzSn9UZn4\noSWjxY+ID7rXgYkIEhZWLRbskwIRrjImBzIwKYd/y1zm1CQQ4jTBrr7LB+VMVGb5\n9ezw+7Qd5fdviYkDA6PLMdhtPcFCafnDH2Z64SXFENbyx+itcjc3Bur8PgN4HYXI\nvacJ7LdoYMoB5fXit45hy+saUyr7sKo0TaqRNi2LzDAnlt7A7r7tfAKTpRuLH8TA\nOSYWWo03/mht/qx0XTI5QJlbfwJuk5h+wU9+Ssa5UCgM7A5UN3u9G/D1iGrk7aF8\nHUJhEZr54cXHGQ7T4eBVPCFIpi8dFl5MiB15EHhu9x6XlIV02vzkQNgfEnXUv9f1\nHAzmKPmmeivs2b8+rL2lxmLvy3meQObZMDRy4udIv6KJZ7Zh+AXJ++mwzAB8nXA+\n+j8=\n-----END ENCRYPTED PRIVATE KEY-----\n",
    "passphrase": "73464c5d994989acee2360c88161ca18",
    "enterpriseID": "909853"
  },
  production: {
    root: rootPath,
    app: {
      name: 'boxadmin4'
    },
    port: process.env.PORT || 3000,
    env: 'prod',
    dburl: 'https://eedevdb.documents.azure.com:443/',
    dbmasterkey: 'drsuY6OxXyHVVtdlg3YwPBEftWD3ZtMNmIFU1PRAtRoJ7ueuPww6GNDT9d8EhSfwSoijgxew3ojFQrCyxTpeCw==',
  },
};

module.exports = config[env];

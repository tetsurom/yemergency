# coding: utf-8

require 'open-uri'
require 'nokogiri'

YOKOSUKA_URL = 'http://yokosuka-opendata.ubin.jp'


dest = open("api_list.md","w")

Nokogiri::HTML(open("#{YOKOSUKA_URL}/dataset"))
    .search("li.dataset-item a")
    .select{|i|
        i['data-format'] == 'geojson'
    }.each{|i|
        dataset = Nokogiri::HTML(open("#{YOKOSUKA_URL + i['href']}"))
        dataset.search("h1").select{|j|
            j['class'] == nil
        }.each{|j|
            dest.puts('')
            dest.puts('###' + j.text.strip)
        }
        dataset.search("ul.dropdown-menu li a.resource-url-analytics")
            .select{|j|
                j['href'].match(/\.geojson/)
            }.each{|j|
                dest.puts('* ' + j['href'])
            }
}

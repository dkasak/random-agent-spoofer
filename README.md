# Random Agent Spoofer #


RAS is a firefox addon which allows the use of various browser profiles, which it can
automatically switch to at random after a chosen period of time has expired.

It also supports other privacy enhancing options


# Features #

- Allows the user to choose a random user agent (From all user agents or desktop only)  

- Allows the user to specify the interval at which the random agent changes.
  Interval can also be random, specific time period or per session if not set

- Persistently remembers the users choice of user agent and time interval if set.

- Provides a quick toggle to enable/disable the addon via right clicking the
  icon.

- Provides option to toggle notifications of user agent changes. 

- Sets other privacy attributes such as buildid, oscpu and platform where the
  values are known.

- It has a left click menu of expandable lists to allow users to quickly choose
  specific user agents

- It has a large list of user agents.

- Option to limit local dom storage

- Option to disable browser cache

- Option to limit fonts to a standard set (monospace, serif, times new roman)

- Option to limit tab history to two

- Option to disable geolocation support

- Option to disable dns prefetching

- Option to disable link prefetching

- Options to send spoofed headers including  via, x-forwarded-for and if-none-match.
 

# What's Next #

I will continue to update the list of useragents and their related properties. 
I hope people will submit information on their browsers so I can keep the list 
up to date and correct. I do not intend to support every single useragent or 
device. The intention of the addon is to help hinder browser fingerprinting.

I will continue to add more features also

# Icons #

Icons are modified versions of those of the crystal project.

Licence : https://www.gnu.org/licenses/lgpl-2.1.html

# Note #

Mozilla has removed support for vendor information in the browser. So while this addon supports it.
It will not show as changed in versions greater than firefox 24.

Please file any bug reports here on github

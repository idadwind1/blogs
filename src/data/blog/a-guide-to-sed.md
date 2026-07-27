---
title: A guide to sed — the ultimate text processing CLI
author: idadwind
pubDatetime: 2026-03-12T09:52:12Z
slug: a-guide-to-sed
featured: true
draft: false
tags:
  - coding
  - unix
  - linux
  - en
  - guide
description: How I started using sed and how you should be using it too
timezone: Asia/Shanghai
---
Developed in 1973, [`sed`](https://en.wikipedia.org/wiki/Sed) has been, since I started using Linux, one of the coolest tools I found alongside `grep`, `watch`, etc. `sed` is an abbreviation for **s**tream **ed**itor. It is based on an editor called [`ed`](https://en.wikipedia.org/wiki/Ed_(text_editor)), an interactive editor that allows you to edit files by entering commands directly into the command line instead of opening a TUI like [`vi`](https://en.wikipedia.org/wiki/Vi_(text_editor)). While `ed` is no longer commonly used in production, `sed` is still highly relevant in modern text processing in CLI.
`sed` is especially powerful when processing large files instantly—something many modern editors struggle with.  
I started using `sed` years ago when I wanted to open a large JSON file that was about several megabytes. My little `nvim` was lagging to death so I just gave up and used `sed`.
> Fun fact: `sed` is part of the UNIX text processing trio: `grep`, `sed`, and `awk`. They ensured that fast and simple text manipulation can be done purely in CLI. They are all shipped by default with most Linux as part of the GNU utilities.
## Input Texts
`sed` reads from a file or `stdin`, which means you can either process texts from a file or piped from another program:
```shell
# Read from file
sed <options> <commands> filename
# Read from pipe
something | sed <options> <commands>
```
We will demonstrate `sed` with `echo` piped into it, so we can have a better understanding of input and output
```shell
echo 123 | sed '' # something like this
```
## Commands
`sed` commands are mostly the same as `ed` commands. We will start with the structure of a `sed` command:

```sed
[address]command[options]
```
Address is some kind of condition code that selects a range of lines.
For example, this command deletes line from 3 to 5:
```sed
3,5d
```
in the command, `3,5` is the range where the command `d`, which means delete, will be executed (and there's no options).

How commands work might be different than what you think. `sed` maintains two buffers (which are a small piece of memory that holds lines of text): the *pattern space* and the *hold space*. They are both initially empty. *Hold space* is just the built in clipboard but *pattern space* is a more complicated thing. When a command is executed, `sed` reads one line from the input stream (either file or `stdin`) and places it in the *pattern space*. It then checks if the line in the *pattern space* matches the condition given by the `[address]` (in the above example, it’s *line from 3 to 5*). If the check succeeded, `sed` performs the command with the options specified. In this way, a single `d` deletes every line of the input because no `[address]` is given and every line scanned is matching and wiped. This whole process is called a *cycle*. At the end of a *cycle*, *sed* dumps what’s in the *pattern space* (you can disable it with argument *-n*). Unless it’s a special command (like `D`), *pattern space* is cleared every cycle.
From time to time, people often think it’s that matching lines are placed in a list and then command is done one by one to each of them. But that’s extremely not efficient and uses a lot of memory.

First, let us talk about addresses
### Addressing lines
- *number*: the *number*th line
- `$`: last line
- `/[regex]/`: line that matches the [regular expression](https://en.wikipedia.org/wiki/Regular_expression) in it
- `[address]!`: line that doesn’t match the address before it
- `[address],[address]`: all lines from the first address to the second address
- `/[regex]/+[offset]`: `[offset]` lines after the regular expression; this is exclusive to the GNU version
- `/[regex]/,+[offset]`: all lines from regular expression to `[offset]` lines after the regular expression; this is exclusive to the GNU version

Now we can move on to some common commands.
### Deleting Texts
The command for **d**eleting texts is `d`. 
No option is available for this command.
Example:
```shell
echo -e "I love eating breads\nI love eating cakes" | sed '1d'
# I love eating cakes
```
> `-e` means to **e**scape the `\n` as line break.
### Appending Texts
The command for **a**ppending line after a line is `a [text]` or alternatively:
```sed
a\
[text]
```
Example:
```shell
echo "I love eating cakes" | sed '1a I don’t love eating breads'
# I love eating cakes
# I don’t love eating breads
```
### Inserting Texts
The command for **i**nserting line before a line is `i`. The syntax is the same as `a`.
Example:
```shell
echo "I don’t love eating breads" | sed '1i I love eating cakes'
# I love eating cakes
# I don’t love eating breads
```
### Changing Texts
The command for **c**hanging a line is `c`. Still, the syntax is the same.
```shell
echo "I love eating breads" | sed '1c I love eating cakes'
# I love eating cakes
```
### Substituting Texts
We **s**ubstitute texts with `s/[regex]/[replacement]/[flags]`. Flags include:
- *number*: only replace the *number*th match
- `g`: **g**lobal, or substitute all matched
- `p`: **p**rint *pattern space* if substituted; this works regardless of `-n`
- `i`: **i**gnore case; this is exclusive to the GNU version
- `m`: **m**ultiline mode: regex can match multiple lines; this is exclusive to the GNU version
- `w`: **w**rite to file if substituted; *if you are using the GNU version, you can write to `/dev/stderr` and `/dev/stdout`*
- `e`: allow a command to be **e**xecuted and pipe into *pattern space*; this is exclusive to the GNU version
Flags are optional. `sed` substitutes the first match by default.
```shell
echo "I love eating breads" | sed 's/bread/cake/g'
# I love eating cakes
```
### Transliterating
A **t**ransliteration (character-to-character substitution, kind of like mapping letters to letters) can be done by `y/[letters]/[corresponding letters]/`.
```shell
echo "I love eating cakes" | sed 'y/Iioe/1!03/'
# 1 l0v3 3at!ng cak3s
```
### Printing
`p` **p**rints what’s in *pattern space* to `stdout` regardless of the option `-n` (which disables printing *pattern space* after each cycle).
No option is available for this command.
```shell
echo "I love eating cakes" | sed -n 'p'
# I love eating cakes
```
### Quitting `sed`
To **q**uit `sed`, use `q[exit code]`
```shell
echo -e "I love eating cakes\nI don’t love eating breads\nI love eating breads" | sed '2q'
# I love eating cakes
# I don’t love eating breads
```
The above example works because `q` is executed after the second cycle (after the second line is put into the *pattern space*), so `sed` prints the first and second line but not the third.
Use `Q` if you do not wish to print content in *pattern space* when quitting. This is GNU version exclusive
### Adding to *Hold Space*
Use `h` to put content in *pattern space* to ***h**old space* so that later you can put it in another line. *Pattern space* is not cleared after this command.
Use `H` to put content in *pattern space* to a new line in *hold space* so that it doesn’t override the previous content in *hold space*.
### Getting from *Hold Space*
Use `g` to put content in *hold space* to *pattern space*.
Use `G` to put content in *hold space* to a new line in *pattern space* so the text won’t replace but insert to a new line below the original one.
### Exchanging *Hold Space* & *Pattern Space*
Use `x` to exchange *content in hold space* and *pattern space*.

If multiple lines are in *hold space*, when filling *pattern space* with *hold space*, following lines might get overridden.

An example with all we just learned about the two spaces:
```shell
echo -e "I love eating cakes\nI don’t love eating breads\nI hate eating breads\nI don’t hate eating cakes" \
| sed '1h;2H;3g;4G;4x'
# I love eating cakes
# I don’t love eating breads
# I love eating cakes
# I don’t love eating breads
# I love eating cakes
# I don’t love eating breads
```
### Others
See more at [GNU `sed` manual](https://www.gnu.org/software/sed/manual/html_node/sed-commands-list.html#sed-commands-list).
## Options for `sed`
We can pass arguments to `sed` to make our life easier.

**Supported arguments**:
- `—n`, `—-quiet`, or `—-silent`: we've been talking about this a lot. This turns off automatically printing *pattern space* after each cycle. This is pretty handy when we don’t want our terminal to be filled with garbage.
- `-e`, or `—-expression=`: this appends a command to the script. `sed -e 'p' -e 'q'` is equivalent to `sed 'p;q'`.
- `-f`, or `—-file=`: this runs a file as script.
- `-i<optional suffix>`, or `—-in-place<=optinal suffix>`: this edit the file in place.
	Use `-i.bak` to backup file.
See more at [GNU `sed` manual](https://www.gnu.org/software/sed/manual/html_node/Command_002dLine-Options.html#Command_002dLine-Options).
## Outro
`sed` is extremely powerful once you learned how to drive it. It is commonly used in data processing, CI/CD, automation because of how it can handle automations easily and efficiently.

At last, I want to show you one more example:
```shell
sed '1!G;h;$!d' file.txt
```
And I want to leave it to you to figure out what this command does to the file as an exercise.
## See Also
- [`sed` manual](https://www.gnu.org/software/sed/manual/html_node/index.html)
- [Why I Love Sed and a Clear/Practical Beginners Guide To Using It.](https://www.linux.org/threads/why-i-love-sed-and-a-clear-practical-beginners-guide-to-using-it.43651/)

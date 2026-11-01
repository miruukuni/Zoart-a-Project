import assert from "node:assert/strict";
import { test } from "node:test";
import { profileName } from "./profile-name.ts";
import { contactHasLink } from "./contact-info.ts";

test("Google display names become author defaults without exposing email addresses", () => {
  assert.equal(profileName({user_metadata:{full_name:" Troy Ngo ",name:"Other"}}),"Troy Ngo");
  assert.equal(profileName({user_metadata:{name:"Troy Ngo"}}),"Troy Ngo");
  assert.equal(profileName({user_metadata:{display_name:"Troy Ngo"}}),"Troy Ngo");
  assert.equal(profileName({email:"private@example.invalid"}),"");
  assert.equal(profileName(null),"");
  assert.equal(profileName({user_metadata:{full_name:123,name:"Valid name"}}),"Valid name");
});

test("contact fields allow plain emails, phone numbers, names and handles", () => {
  for (const value of ["hello@uci.edu","Troy Ngo: troy@example.com","+1 (949) 555-0100","Discord: @troy.ngo","Meet at the library","@my.handle"]) assert.equal(contactHasLink(value),false,value);
});

test("contact fields reject URL schemes, bare domains, IPs and encoded links", () => {
  for (const value of ["https://uci.edu","http://example.com","www.example.com","github.com/team/repo","discord.gg/invite","javascript:alert(1)","mailto:hello@uci.edu","//evil.example/x","127.0.0.1:8000","[::1]","https%3A%2F%2Fuci.edu","ｅｘａｍｐｌｅ．ｃｏｍ","例子.中国"]) assert.equal(contactHasLink(value),true,value);
});

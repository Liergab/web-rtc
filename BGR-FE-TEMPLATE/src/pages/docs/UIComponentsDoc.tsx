import React, { useState } from 'react';
import { 
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Alert, AlertTitle, AlertDescription,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
  Avatar, AvatarImage, AvatarFallback,
  Calendar,
  DatePicker,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator,
  Tabs, TabsList, TabsTrigger, TabsContent,
  TimePicker,
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent
} from '../../components/ui';

const UIComponentsDoc = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">UI Components Documentation</h1>
      
      {/* Table of Contents */}
      <div className="mb-10 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
        <ul className="space-y-1">
          <li><a href="#accordion" className="text-blue-600 hover:underline">Accordion</a></li>
          <li><a href="#alert" className="text-blue-600 hover:underline">Alert</a></li>
          <li><a href="#alert-dialog" className="text-blue-600 hover:underline">Alert Dialog</a></li>
          <li><a href="#avatar" className="text-blue-600 hover:underline">Avatar</a></li>
          <li><a href="#calendar" className="text-blue-600 hover:underline">Calendar</a></li>
          <li><a href="#datepicker" className="text-blue-600 hover:underline">DatePicker</a></li>
          <li><a href="#dialog" className="text-blue-600 hover:underline">Dialog</a></li>
          <li><a href="#form" className="text-blue-600 hover:underline">Form</a></li>
          <li><a href="#select" className="text-blue-600 hover:underline">Select</a></li>
          <li><a href="#tabs" className="text-blue-600 hover:underline">Tabs</a></li>
          <li><a href="#timepicker" className="text-blue-600 hover:underline">TimePicker</a></li>
          <li><a href="#tooltip" className="text-blue-600 hover:underline">Tooltip</a></li>
        </ul>
      </div>

      {/* Accordion */}
      <section id="accordion" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Accordion</h2>
        <p className="mb-4">A vertically stacked set of interactive headings that each reveal a section of content.</p>
        
        <div className="mb-4 bg-white p-4 rounded-lg border">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that match the other components' aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It's animated by default, but you can disable it if you prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
        </pre>
      </section>

      {/* Alert */}
      <section id="alert" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Alert</h2>
        <p className="mb-4">Displays a callout for user attention.</p>
        
        <div className="mb-4 space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert — check it out!
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
          
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully.
            </AlertDescription>
          </Alert>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>`}
        </pre>
      </section>

      {/* Alert Dialog */}
      <section id="alert-dialog" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Alert Dialog</h2>
        <p className="mb-4">A modal dialog that interrupts the user with important content and expects a response.</p>
        
        <div className="mb-4">
          <AlertDialog>
            <AlertDialogTrigger className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Show Alert Dialog
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<AlertDialog>
  <AlertDialogTrigger>Show Alert Dialog</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
        </pre>
      </section>

      {/* Avatar */}
      <section id="avatar" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Avatar</h2>
        <p className="mb-4">An image element with a fallback for representing the user.</p>
        
        <div className="mb-4 flex space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          <Avatar size="lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          <Avatar shape="square">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          <Avatar>
            <AvatarImage src="invalid-image-url.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
        </pre>
      </section>

      {/* Calendar */}
      <section id="calendar" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <p className="mb-4">A calendar component that allows users to select dates.</p>
        
        <div className="mb-4 max-w-sm">
          <Calendar 
            selected={selectedDate}
            onDateChange={(date) => setSelectedDate(date)}
          />
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`const [date, setDate] = useState<Date>(new Date());

<Calendar 
  selected={date}
  onDateChange={(date) => setDate(date)}
  minDate={new Date(2023, 0, 1)}
  maxDate={new Date(2023, 11, 31)}
/>`}
        </pre>
      </section>

      {/* DatePicker */}
      <section id="datepicker" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">DatePicker</h2>
        <p className="mb-4">A date picker built on top of the Calendar component.</p>
        
        <div className="mb-4 max-w-sm">
          <DatePicker 
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Select a date"
          />
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`const [date, setDate] = useState<Date | undefined>(new Date());

<DatePicker 
  value={date}
  onChange={setDate}
  placeholder="Select a date"
  format="yyyy-MM-dd"
  clearable
/>`}
        </pre>
      </section>

      {/* Dialog */}
      <section id="dialog" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Dialog</h2>
        <p className="mb-4">A window overlaid on the primary window, rendering the content underneath inert.</p>
        
        <div className="mb-4">
          <Dialog>
            <DialogTrigger className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Show Dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Dialog content goes here.</p>
              </div>
              <DialogFooter>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2">
                  Cancel
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                  Save changes
                </button>
              </DialogFooter>
              <DialogClose />
            </DialogContent>
          </Dialog>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Dialog>
  <DialogTrigger>Show Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p>Dialog content goes here.</p>
    </div>
    <DialogFooter>
      <button>Cancel</button>
      <button>Save changes</button>
    </DialogFooter>
    <DialogClose />
  </DialogContent>
</Dialog>`}
        </pre>
      </section>

      {/* Form */}
      <section id="form" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Form</h2>
        <p className="mb-4">Building blocks for creating accessible forms.</p>
        
        <div className="mb-4 bg-white p-6 rounded-lg border">
          <Form>
            <FormField name="username">
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage>
                  Username must be at least 4 characters.
                </FormMessage>
              </FormItem>
            </FormField>
          </Form>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Form>
  <FormField name="username">
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <input type="text" />
      </FormControl>
      <FormDescription>
        This is your public display name.
      </FormDescription>
      <FormMessage>
        Username must be at least 4 characters.
      </FormMessage>
    </FormItem>
  </FormField>
</Form>`}
        </pre>
      </section>

      {/* Select */}
      <section id="select" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Select</h2>
        <p className="mb-4">Displays a list of options for the user to pick from.</p>
        
        <div className="mb-4 w-[240px]">
          <Select defaultValue="apple">
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Vegetables</SelectLabel>
                <SelectItem value="carrot">Carrot</SelectItem>
                <SelectItem value="potato">Potato</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
        </pre>
      </section>

      {/* Tabs */}
      <section id="tabs" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Tabs</h2>
        <p className="mb-4">A set of layered sections of content—known as tab panels—that display one panel at a time.</p>
        
        <div className="mb-4">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className="p-4 bg-white rounded-lg border mt-2">
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-gray-600 mt-2">
                  Manage your account settings and preferences.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className="p-4 bg-white rounded-lg border mt-2">
                <h3 className="text-lg font-medium">Password Settings</h3>
                <p className="text-gray-600 mt-2">
                  Change your password here.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="p-4 bg-white rounded-lg border mt-2">
                <h3 className="text-lg font-medium">Application Settings</h3>
                <p className="text-gray-600 mt-2">
                  Configure your application preferences.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <h3>Account Settings</h3>
    <p>Manage your account settings and preferences.</p>
  </TabsContent>
  <TabsContent value="password">
    <h3>Password Settings</h3>
    <p>Change your password here.</p>
  </TabsContent>
</Tabs>`}
        </pre>
      </section>

      {/* TimePicker */}
      <section id="timepicker" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">TimePicker</h2>
        <p className="mb-4">A time picker that allows users to select a time value.</p>
        
        <div className="mb-4 max-w-sm">
          <TimePicker 
            placeholder="Select a time"
          />
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`const [time, setTime] = useState<Time | undefined>();

<TimePicker 
  value={time}
  onChange={setTime}
  placeholder="Select a time"
  use24Hour={false}
  minuteStep={15}
  clearable
/>`}
        </pre>
      </section>

      {/* Tooltip */}
      <section id="tooltip" className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Tooltip</h2>
        <p className="mb-4">A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.</p>
        
        <div className="mb-4 flex justify-center">
          <TooltipProvider>
            <Tooltip content="This is a tooltip">
              <TooltipTrigger asChild>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                  Hover me
                </button>
              </TooltipTrigger>
              <TooltipContent>
                This is a tooltip
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Usage</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
{`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button>Hover me</button>
    </TooltipTrigger>
    <TooltipContent>
      This is a tooltip
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`}
        </pre>
      </section>
    </div>
  );
};

export default UIComponentsDoc; 